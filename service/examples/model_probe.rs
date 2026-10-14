//! Offline model-replacement probe.
//!
//! Replays production LLM steps against a *copy* of the production database,
//! swapping only the model. Prompt construction, JSON sanitising, retry loops,
//! TikZ rendering and the annotation layout engine are the production code
//! (or line-for-line replicas where the production fn is private / hard-wires
//! its client).
//!
//! Run from a directory whose parent contains `data/metis.db` (debug builds
//! resolve the app base dir to `..`), with PROBE_ENV pointing at a .env that
//! holds VERTEX_AI_SERVICE_ACCOUNT and OPEN_AI_KEY:
//!
//!   cargo run --example model_probe -- <stage> <id> <model> <out_dir> [extra]
//!
//! stages: narrator | curator | illustrator | enhancer | compose | architect | chat
//! models: gemini-3.1-pro-preview | gpt-5.6-sol | gpt-6-astra (any Azure/OpenAI
//!         Responses deployment name that does not start with `gemini`)

use std::{
    collections::{HashMap, HashSet},
    env, fs,
    path::Path,
    time::Instant,
};

use app_lib::{
    agent::{
        evaluator::tools::{ConcludeQuaestioTool, FetchArcMaterialTool},
        tutor::tools::{
            FetchMoreDialoguesTool, FetchReferenceMaterialTool, GetCurrentDialogueIdTool,
            ReadTutorNotesTool, SetTutorNotesTool,
        },
    },
    app::{
        dialogue::{
            blackboard::{BlackboardInstructions, ElementDescriptor},
            segment::{Segment, SegmentAction},
            Dialogue, ArtifactReference,
        },
        events::{Event, EventHistory, EventType},
        explanation::{artifact::ExplanationArtifacts, Step},
        journey::artifact::JourneyArtifacts,
        AppContext,
    },
    db::repo::{
        appdata::AppDataRepo, dialogue::DialoguesRepo, dialogue_events::DialogueEventsRepo,
        Repository,
    },
    error::{MetisError, Result},
    llm_client::{
        clients::{
            gemini::{chat::GeminiChat, client::GeminiClient},
            openai::{chat::OpenAiChat, client::OpenAiClient, ReasoningEffort},
        },
        llm_client::{LLMChatClient, LLMClient},
        tool::Tool,
    },
    prompts::get_prompt_provider,
    task::tasks::compose_explainer::{
        annotation::EnhancerOutput,
        layout::{layout, LayoutInput},
        templates::COORDINATE_SAVE,
    },
    utils::{
        dialogue::{format_dialogues, get_before_dialogue, pedagogy_arc_json, pedagogy_topic_json},
        format::{fix_mathtext_shorthands, sanitize_json},
        latex::execute_latex,
        narrator::{load_explanation_material, load_topic_content},
        python::execute_python,
        svg::{extract_part_bboxes, svg_dimensions},
    },
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

fn reasoning_effort() -> ReasoningEffort {
    match env::var("PROBE_REASONING_EFFORT").as_deref() {
        Ok("none") => ReasoningEffort::None,
        Ok("low") => ReasoningEffort::Low,
        Ok("medium") => ReasoningEffort::Medium,
        Ok("xhigh") => ReasoningEffort::XHigh,
        Ok("max") => ReasoningEffort::Max,
        _ => ReasoningEffort::High,
    }
}

fn make_client(model: &str) -> Box<dyn LLMClient> {
    if model.starts_with("gemini") {
        Box::new(GeminiClient::with_model(model))
    } else {
        Box::new(OpenAiClient::with_model(model, reasoning_effort()))
    }
}

fn make_chat<'a>(model: &str, ctx: &'a AppContext) -> Box<dyn LLMChatClient + 'a> {
    if model.starts_with("gemini") {
        Box::new(GeminiChat::with_model(model, ctx))
    } else {
        Box::new(OpenAiChat::with_model(model, reasoning_effort(), ctx))
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

struct Out {
    dir: String,
}

impl Out {
    fn new(dir: &str) -> Self {
        fs::create_dir_all(dir).unwrap();
        Self { dir: fs::canonicalize(dir).unwrap().to_string_lossy().into_owned() }
    }
    fn path(&self, name: &str) -> String {
        format!("{}/{}", self.dir, name)
    }
    fn write(&self, name: &str, content: impl AsRef<[u8]>) {
        fs::write(self.path(name), content).unwrap();
    }
    fn json(&self, name: &str, v: &impl Serialize) {
        self.write(name, serde_json::to_string_pretty(v).unwrap());
    }
}

async fn timed(client: &dyn LLMClient, msg: &str, out: &Out, tag: &str, log: &mut Vec<Value>) -> Result<String> {
    let t = Instant::now();
    let r = client.generate(msg.to_string()).await;
    let secs = t.elapsed().as_secs_f64();
    match &r {
        Ok(resp) => {
            out.write(&format!("{tag}.raw.txt"), resp.text());
            log.push(json!({"call": tag, "seconds": secs, "ok": true, "chars": resp.text().len()}));
        }
        Err(e) => log.push(json!({"call": tag, "seconds": secs, "ok": false, "error": e.to_string()})),
    }
    r.map(|x| x.text())
}

fn prod_checkpoint(dialogue_id: i64) -> Result<Value> {
    let conn = rusqlite::Connection::open(app_lib::utils::paths::db_path())?;
    let raw: String = conn.query_row(
        "SELECT checkpoint FROM background_tasks WHERE name='compose_explainer' AND status='completed' \
         AND json_extract(params,'$.dialogue_id')=?1 ORDER BY updated_at DESC LIMIT 1",
        [dialogue_id],
        |r| r.get(0),
    )?;
    Ok(serde_json::from_str(&raw)?)
}

fn dialogue(id: i64) -> Result<Dialogue> {
    Ok(Repository::<Dialogue>::find_by_id(&id)?.read().clone())
}

// ---------------------------------------------------------------------------
// Narrator (mirrors task/tasks/draft_dialogues/narrator.rs, but only uses
// dialogues that existed *before* the target, as at production time)
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
struct NarratorOutput {
    title: String,
    dialogue: String,
    topic_complete: bool,
    blackboard_instructions: BlackboardInstructions,
}

async fn narrator(id: i64, model: &str, out: &Out, log: &mut Vec<Value>) -> Result<()> {
    let target = dialogue(id)?;
    let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();
    let all = DialoguesRepo::get_for_parent(target.reference.kind(), target.reference.parent_id())?;
    let prior: Vec<Dialogue> = all.iter().map(|p| p.read().clone()).filter(|d| d.idx < target.idx).collect();
    let recent = &prior[prior.len().saturating_sub(10)..];
    let recent_content = recent.iter().map(|d| d.content.clone()).collect::<Vec<_>>().join("\n\n---\n\n");
    let blackboard_state = prior.last().map(|d| d.blackboard.description.clone()).unwrap_or_default();

    let prompt = match target.reference {
        ArtifactReference::Journey { journey_id, arc_idx, topic_idx } => {
            let a = Repository::<JourneyArtifacts>::find_by_id(&journey_id)?;
            let a = a.read();
            let arc_json = pedagogy_arc_json(a.get_arc(arc_idx))?;
            let topic = a.get_topic(arc_idx, topic_idx).ok_or(MetisError::ParamsError("bad topic".into()))?;
            let topic_json = pedagogy_topic_json(topic)?;
            let reference = load_topic_content(&a.chapter_dir, &topic.name);
            get_prompt_provider().get_journey_narrator_prompt(&profile, &arc_json, &topic_json, &recent_content, &reference, &blackboard_state)
        }
        ArtifactReference::Explanation { explanation_id, step_idx } => {
            let a = Repository::<ExplanationArtifacts>::find_by_id(&explanation_id)?;
            let a = a.read();
            let plan = serde_json::to_string_pretty(&a.explanation)?;
            let step = a.get_step(step_idx).ok_or(MetisError::ParamsError("bad step".into()))?;
            let step_s = serde_json::to_string_pretty(step)?;
            let reference = load_explanation_material(&a.explanation_directory);
            get_prompt_provider().get_explainer_narrator_prompt(&profile, &plan, &step_s, &recent_content, &reference, &blackboard_state)
        }
        ArtifactReference::None => return Err(MetisError::ParamsError("no reference".into())),
    };
    out.write("narrator.prompt.md", &prompt);
    let mut client = make_client(model);
    client.set_json_mode(true);
    client.set_system_prompt(prompt);
    let raw = timed(client.as_ref(), "Generate the next dialogue chunk.", out, "narrator", log).await?;
    let parsed: NarratorOutput = serde_json::from_str(&sanitize_json(&raw))?;
    out.json(
        "narrator.json",
        &json!({
            "title": parsed.title,
            "dialogue": parsed.dialogue,
            "topic_complete": parsed.topic_complete,
            "blackboard_instructions": parsed.blackboard_instructions.to_string(),
        }),
    );
    out.write(
        "narrator.md",
        format!("# {}\n\n{}\n\n---\n**Blackboard:** {}\n", parsed.title, parsed.dialogue, parsed.blackboard_instructions.to_string()),
    );
    Ok(())
}

// ---------------------------------------------------------------------------
// Curator (mirrors compose_explainer/curator.rs) + structural validation
// ---------------------------------------------------------------------------

#[derive(Deserialize, Serialize, Clone)]
struct Curation {
    dialogue: String,
    parts: Vec<ElementDescriptor>,
    segments: Vec<Segment>,
}

fn validate_curation(c: &Curation, input_dialogue: &str) -> Value {
    let ids: Vec<String> = c.parts.iter().map(|p| p.id.clone()).collect();
    let idset: HashSet<&String> = ids.iter().collect();
    let mut reveal_count: HashMap<String, usize> = HashMap::new();
    let mut unknown = Vec::new();
    let mut n_actions = HashMap::<&str, usize>::new();
    let mut bad_naming = Vec::new();
    for s in &c.segments {
        for a in &s.actions {
            let (kind, targets): (&str, Vec<String>) = match a {
                SegmentAction::Reveal { targets } => {
                    for t in targets {
                        *reveal_count.entry(t.clone()).or_default() += 1;
                    }
                    ("reveal", targets.clone())
                }
                SegmentAction::Focus { targets } => ("focus", targets.clone()),
                SegmentAction::Pulse { targets, .. } => ("pulse", targets.clone()),
                SegmentAction::Morph { from, to, .. } => {
                    if !(from.ends_with("-before") && to.ends_with("-after")) {
                        bad_naming.push(format!("morph {from}->{to}"));
                    }
                    ("morph", vec![from.clone(), to.clone()])
                }
                SegmentAction::Connect { from, to, .. } => ("connect", vec![from.clone(), to.clone()]),
                SegmentAction::Trace { target, along, .. } => {
                    if !target.ends_with("-point") {
                        bad_naming.push(format!("trace {target}"));
                    }
                    ("trace", vec![target.clone(), along.clone()])
                }
            };
            *n_actions.entry(kind).or_default() += 1;
            for t in targets {
                if !idset.contains(&t) {
                    unknown.push(t);
                }
            }
        }
    }
    let concat: String = c.segments.iter().map(|s| s.text.clone()).collect();
    let never: Vec<&String> = ids.iter().filter(|i| !reveal_count.contains_key(*i)).collect();
    let dup: Vec<&String> = reveal_count.iter().filter(|(_, n)| **n > 1).map(|(k, _)| k).collect();
    json!({
        "n_parts": ids.len(),
        "n_segments": c.segments.len(),
        "actions": n_actions,
        "segments_concat_equals_dialogue": concat == c.dialogue,
        "dialogue_unchanged_from_input": c.dialogue.trim() == input_dialogue.trim(),
        "dialogue_len_delta": c.dialogue.len() as i64 - input_dialogue.len() as i64,
        "parts_never_revealed": never,
        "parts_revealed_twice": dup,
        "unknown_ids": unknown,
        "naming_violations": bad_naming,
    })
}

async fn curate(d: &Dialogue, model: &str, out: &Out, log: &mut Vec<Value>, tag: &str) -> Result<Curation> {
    let prompt = get_prompt_provider().get_curator_prompt(&d.content, &d.blackboard.description);
    let mut client = make_client(model);
    client.set_system_prompt(prompt);
    client.set_json_mode(true);
    let raw = timed(client.as_ref(), "Produce the curation.", out, tag, log).await?;
    let c: Curation = match serde_json::from_str(&sanitize_json(&raw)) {
        Ok(c) => c,
        Err(e) => {
            log.push(json!({"call": tag, "parse_error": e.to_string()}));
            return Err(e.into());
        }
    };
    out.json(&format!("{tag}.json"), &c);
    out.json(&format!("{tag}.validation.json"), &validate_curation(&c, &d.content));
    Ok(c)
}

// ---------------------------------------------------------------------------
// Illustrator (mirrors compose_explainer/illustrator.rs incl. retry loop)
// ---------------------------------------------------------------------------

#[derive(Deserialize, Serialize)]
struct IllustratorOutput {
    library: String,
    code: String,
}

struct Illustration {
    svg: String,
    library: String,
    code: String,
}

async fn illustrate(
    d: &Dialogue,
    dialogue_text: &str,
    parts: &[ElementDescriptor],
    model: &str,
    out: &Out,
    log: &mut Vec<Value>,
    tag: &str,
) -> Result<Option<Illustration>> {
    let parts_json = if parts.is_empty() {
        "(No parts were pre-designed — default to sensible semantic ids.)".to_string()
    } else {
        serde_json::to_string_pretty(parts).unwrap()
    };
    let prompt = get_prompt_provider().get_blackboard_prompt(&d.blackboard.description, dialogue_text, &parts_json);
    let mut client = make_client(model);
    client.set_json_mode(true);
    client.set_system_prompt(prompt);
    let mut msg = "Produce the figure code.".to_string();
    for attempt in 0..=5 {
        let raw = timed(client.as_ref(), &msg, out, &format!("{tag}.attempt{attempt}"), log).await?;
        let parsed: IllustratorOutput = match serde_json::from_str(&sanitize_json(&raw)) {
            Ok(v) => v,
            Err(e) => {
                log.push(json!({"call": tag, "attempt": attempt, "parse_error": e.to_string()}));
                msg = format!(
                    "Your previous response failed to parse as JSON with error: {e}\n\n\
                     Respond with ONLY the JSON object {{\"library\": \"...\", \"code\": \"...\"}} \
                     — no markdown fences, no commentary, no trailing characters. Ensure the \
                     object is complete and every brace is balanced."
                );
                continue;
            }
        };
        let svg = out.path(&format!("{tag}.svg"));
        let (code, res) = if parsed.library == "tikz" {
            (parsed.code.clone(), execute_latex(&parsed.code, &svg))
        } else {
            let code = fix_mathtext_shorthands(&parsed.code).replace("{output_path}", &svg);
            (code.clone(), execute_python(&code))
        };
        match res {
            Ok(()) if Path::new(&svg).exists() => {
                out.write(&format!("{tag}.{}", if parsed.library == "tikz" { "tex" } else { "py" }), &code);
                log.push(json!({"call": tag, "rendered_on_attempt": attempt, "library": parsed.library}));
                return Ok(Some(Illustration { svg, library: parsed.library, code }));
            }
            other => {
                let err = match other {
                    Err(e) => e.to_string(),
                    _ => format!("execution succeeded but no file at {svg}"),
                };
                log.push(json!({"call": tag, "attempt": attempt, "render_error": err.chars().take(600).collect::<String>()}));
                msg = format!(
                    "Your previous {library} attempt failed when executed. Read the error, fix the issue, and respond with a corrected JSON block (same schema). Do not repeat the same mistake.\n\n\
                     ## Previous code\n```{library}\n{code}\n```\n\n## Execution error\n```\n{err}\n```\n\nProduce the corrected figure code now.",
                    library = parsed.library,
                );
            }
        }
    }
    log.push(json!({"call": tag, "gave_up": true}));
    Ok(None)
}

// ---------------------------------------------------------------------------
// Enhancer / annotation (mirrors compose_explainer/enhancer.rs)
// ---------------------------------------------------------------------------

#[allow(clippy::too_many_arguments)]
async fn enhance(
    d: &Dialogue,
    source_tikz: &str,
    base_svg_path: &str,
    parts: &[ElementDescriptor],
    segments: &[Segment],
    dialogue_text: &str,
    model: &str,
    out: &Out,
    log: &mut Vec<Value>,
    tag: &str,
) -> Result<()> {
    let listing = if parts.is_empty() {
        "(no named parts in this figure)".to_string()
    } else {
        parts.iter().map(|p| format!("- {}: {}", p.id, p.desc)).collect::<Vec<_>>().join("\n")
    };
    let prompt = get_prompt_provider().get_enhancer_prompt(&d.blackboard.description, &d.heading, dialogue_text, &listing);
    let mut client = make_client(model);
    client.set_json_mode(true);
    client.set_system_prompt(prompt);
    let mut msg = "Produce the enhancement.".to_string();
    let mut parsed: Option<EnhancerOutput> = None;
    for attempt in 0..=1 {
        let raw = timed(client.as_ref(), &msg, out, &format!("{tag}.attempt{attempt}"), log).await?;
        match serde_json::from_str::<EnhancerOutput>(&sanitize_json(&raw)) {
            Ok(v) => {
                parsed = Some(v);
                break;
            }
            Err(e) => {
                log.push(json!({"call": tag, "parse_error": e.to_string()}));
                msg = "Your previous response was not valid JSON matching the schema. \
                       Respond again with only the JSON object — no markdown, no commentary."
                    .to_string();
            }
        }
    }
    let Some(parsed) = parsed else {
        log.push(json!({"call": tag, "result": "parse_failed"}));
        return Ok(());
    };
    out.json(&format!("{tag}.annotations.json"), &parsed);
    if parsed.annotations.is_empty() {
        log.push(json!({"call": tag, "result": "no_annotations"}));
        return Ok(());
    }
    let svg = fs::read_to_string(base_svg_path).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    let existing: HashSet<String> = parts.iter().map(|p| p.id.clone()).collect();
    let lay = layout(LayoutInput {
        annotations: parsed.annotations,
        bboxes: extract_part_bboxes(&svg),
        canvas: svg_dimensions(&svg).unwrap_or((0.0, 0.0)),
        segments,
        existing_part_ids: existing,
    });
    if lay.snippets.is_empty() {
        log.push(json!({"call": tag, "result": "layout_empty"}));
        return Ok(());
    }
    let idx = source_tikz
        .rfind("\\end{tikzpicture}")
        .ok_or(MetisError::UtilsError("no tikz end".into()))?;
    let mut block = String::from("\n% --- enhancer additions ---\n");
    block.push_str(COORDINATE_SAVE);
    block.push('\n');
    for (gid, snip) in &lay.snippets {
        block.push_str(&format!("\\gid{{{gid}}}{{{snip}}}\n"));
    }
    let spliced = format!("{}{}{}", &source_tikz[..idx], block, &source_tikz[idx..]);
    out.write(&format!("{tag}.tex"), &spliced);
    let svg_out = out.path(&format!("{tag}.svg"));
    match execute_latex(&spliced, &svg_out) {
        Ok(()) => log.push(json!({"call": tag, "result": "rendered", "n_snippets": lay.snippets.len()})),
        Err(e) => log.push(json!({"call": tag, "result": "latex_failed", "error": e.to_string().chars().take(600).collect::<String>()})),
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Explanation architect (mirrors task/tasks/create_explainer.rs)
// ---------------------------------------------------------------------------

#[derive(Deserialize, Serialize)]
struct ArchitectOutput {
    title: String,
    steps: Vec<Step>,
}

async fn architect(eid: i64, model: &str, out: &Out, log: &mut Vec<Value>) -> Result<()> {
    let a = Repository::<ExplanationArtifacts>::find_by_id(&eid)?;
    let a = a.read();
    let material = load_explanation_material(&a.explanation_directory);
    let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();
    let mut client = make_client(model);
    client.set_json_mode(true);
    client.set_system_prompt(get_prompt_provider().get_explanation_architect_prompt(&profile, &material));
    let raw = timed(client.as_ref(), "Plan the explanation route.", out, "architect", log).await?;
    let parsed: ArchitectOutput = serde_json::from_str(&sanitize_json(&raw))?;
    out.json("architect.json", &parsed);
    out.json("architect.prod.json", &json!({"title": a.title, "steps": a.explanation.steps}));
    Ok(())
}

// ---------------------------------------------------------------------------
// Tutor / evaluator next-turn replay (mirrors agent/{tutor,evaluator})
// ---------------------------------------------------------------------------

async fn chat(did: i64, turn: usize, model: &str, out: &Out, log: &mut Vec<Value>) -> Result<()> {
    let d = dialogue(did)?;
    let ctx: &'static AppContext = Box::leak(Box::new(AppContext::init()?));
    ctx.chat.lock().await.dialogue_id = Some(did);

    let is_question = matches!(d.kind, app_lib::app::dialogue::kind::DialogueKind::Question);
    let mut client = make_chat(model, ctx);
    let tools: Vec<Box<dyn Tool>> = if is_question {
        vec![Box::new(ReadTutorNotesTool), Box::new(FetchArcMaterialTool), Box::new(ConcludeQuaestioTool)]
    } else {
        vec![
            Box::new(FetchMoreDialoguesTool),
            Box::new(FetchReferenceMaterialTool),
            Box::new(GetCurrentDialogueIdTool),
            Box::new(ReadTutorNotesTool),
            Box::new(SetTutorNotesTool),
        ]
    };
    for t in tools {
        client.add_tool(t);
    }

    let system = match d.reference {
        ArtifactReference::Journey { journey_id, arc_idx, topic_idx } => {
            let a = Repository::<JourneyArtifacts>::find_by_id(&journey_id)?;
            let a = a.read();
            let arc = a.get_arc(arc_idx).ok_or(MetisError::ParamsError("arc".into()))?;
            if is_question {
                get_prompt_provider().get_evaluator_system_prompt(&a.chapter_title, &arc.arc_title, &d.content)
            } else {
                let topic = a.get_topic(arc_idx, topic_idx).ok_or(MetisError::ParamsError("topic".into()))?;
                let formatted = format_dialogues(&get_before_dialogue(did, 10, true)?);
                get_prompt_provider().get_tutor_system_prompt(&a.chapter_title, &arc.arc_title, &topic.name, &formatted)
            }
        }
        ArtifactReference::Explanation { explanation_id, step_idx } => {
            let a = Repository::<ExplanationArtifacts>::find_by_id(&explanation_id)?;
            let a = a.read();
            let step = a.get_step(step_idx).ok_or(MetisError::ParamsError("step".into()))?;
            let formatted = format_dialogues(&get_before_dialogue(did, 10, true)?);
            get_prompt_provider().get_explainer_tutor_system_prompt(&a.title, &step.name, step.label.as_str(), &step.brief, &formatted)
        }
        ArtifactReference::None => return Err(MetisError::ParamsError("none".into())),
    };

    let full = DialogueEventsRepo::get_for_dialogue(did)?;
    let user_positions: Vec<usize> = full
        .events
        .iter()
        .enumerate()
        .filter(|(_, e)| matches!(e.event_type, EventType::UserMessage))
        .map(|(i, _)| i)
        .collect();
    let pos = *user_positions.get(turn).ok_or(MetisError::ParamsError("turn out of range".into()))?;
    let next = user_positions.get(turn + 1).copied().unwrap_or(full.events.len());
    let message = full.events[pos].content.clone();
    let mut prefix = EventHistory::new();
    prefix.events = full.events[..pos].to_vec();
    let claude_events: Vec<Event> = full.events[pos + 1..next].to_vec();

    client.set_system_prompt(system);
    client.set_event_history(prefix);
    let t = Instant::now();
    let reply = client.generate(message.clone()).await;
    let secs = t.elapsed().as_secs_f64();
    let hist = client.get_event_history();
    let new_events: Vec<Event> = hist.events.get(pos + 1..).map(|s| s.to_vec()).unwrap_or_default();
    let fmt = |evs: &[Event]| -> String {
        evs.iter()
            .map(|e| match e.event_type {
                EventType::LlmMessage => format!("**assistant:**\n\n{}\n", e.content),
                EventType::UserMessage => format!("**user:**\n\n{}\n", e.content),
                EventType::FunctionCall => format!("`tool call: {}({})`\n", e.name, e.content),
                EventType::FunctionResponse => format!("`tool result: {} ({} chars)`\n", e.name, e.content.len()),
                EventType::UserRequest => String::new(),
            })
            .collect::<Vec<_>>()
            .join("\n")
    };
    out.write(
        "chat.md",
        format!(
            "# Dialogue {did}, user turn {turn} ({})\n\n## User message\n\n{message}\n\n## Claude (production)\n\n{}\n\n## {model}\n\n{}\n",
            if is_question { "evaluator" } else { "tutor" },
            fmt(&claude_events),
            fmt(&new_events),
        ),
    );
    log.push(json!({"call": "chat", "seconds": secs, "ok": reply.is_ok(), "error": reply.err().map(|e| e.to_string())}));
    Ok(())
}

// ---------------------------------------------------------------------------

#[tokio::main]
async fn main() {
    if let Ok(p) = env::var("PROBE_ENV") {
        dotenvy::from_path(p).expect("PROBE_ENV not readable");
    }
    let args: Vec<String> = env::args().collect();
    if args.len() < 5 {
        eprintln!("usage: model_probe <stage> <id> <model> <out_dir> [extra]");
        std::process::exit(2);
    }
    let (stage, id, model, out_dir) = (&args[1], args[2].parse::<i64>().unwrap(), &args[3], &args[4]);
    let out = Out::new(out_dir);
    let mut log: Vec<Value> = Vec::new();
    let res: Result<()> = async {
        match stage.as_str() {
            "narrator" => narrator(id, model, &out, &mut log).await,
            "curator" => {
                let d = dialogue(id)?;
                curate(&d, model, &out, &mut log, "curation").await.map(|_| ())
            }
            "illustrator" => {
                // Isolated: production (Claude) parts + dialogue; only the illustrator model changes.
                let d = dialogue(id)?;
                let ck = prod_checkpoint(id)?;
                let cur: Curation = serde_json::from_value(ck["curation_output"].clone())?;
                illustrate(&d, &cur.dialogue, &cur.parts, model, &out, &mut log, "illustration").await.map(|_| ())
            }
            "enhancer" => {
                // Isolated: production illustrator TikZ + SVG and production curation.
                let d = dialogue(id)?;
                let ck = prod_checkpoint(id)?;
                let cur: Curation = serde_json::from_value(ck["curation_output"].clone())?;
                let src = ck["illustration_output"]["source_code"].as_str().unwrap_or_default().to_string();
                let base = ck["illustration_output"]["blackboard"]["image_url"].as_str().unwrap_or_default().to_string();
                enhance(&d, &src, &base, &cur.parts, &cur.segments, &cur.dialogue, model, &out, &mut log, "enhanced").await
            }
            "compose" => {
                // Full compose_explainer chain: curator+enhancer = <model>, illustrator = [extra] (default Gemini Pro).
                let ill_model = args.get(5).cloned().unwrap_or_else(|| app_lib::llm_client::factory::GEMINI_PRO.into());
                let d = dialogue(id)?;
                let cur = curate(&d, model, &out, &mut log, "compose.curation").await?;
                if let Some(ill) = illustrate(&d, &cur.dialogue, &cur.parts, &ill_model, &out, &mut log, "compose.illustration").await? {
                    if ill.library == "tikz" {
                        enhance(&d, &ill.code, &ill.svg, &cur.parts, &cur.segments, &cur.dialogue, model, &out, &mut log, "compose.enhanced").await?;
                    }
                }
                Ok(())
            }
            "prod" => {
                // Dump the production artifacts for side-by-side comparison.
                let d = dialogue(id)?;
                let ck = prod_checkpoint(id)?;
                let cur: Curation = serde_json::from_value(ck["curation_output"].clone())?;
                out.write("narrator.md", format!("# {}\n\n{}\n\n---\n**Blackboard:** {}\n", d.heading, d.content, d.blackboard.description));
                out.json("curation.json", &cur);
                out.json("curation.validation.json", &validate_curation(&cur, &d.content));
                if let Some(src) = ck["illustration_output"]["source_code"].as_str() {
                    out.write("illustration.tex", src);
                }
                for (key, name) in [("illustration_output", "illustration.svg"), ("enhancer_output", "enhanced.svg")] {
                    if let Some(p) = ck[key]["blackboard"]["image_url"].as_str() {
                        let _ = fs::copy(p, out.path(name));
                    }
                }
                Ok(())
            }
            "architect" => architect(id, model, &out, &mut log).await,
            "chat" => chat(id, args.get(5).and_then(|s| s.parse().ok()).unwrap_or(0), model, &out, &mut log).await,
            other => Err(MetisError::ParamsError(format!("unknown stage {other}"))),
        }
    }
    .await;
    if let Err(e) = &res {
        log.push(json!({"fatal": e.to_string()}));
    }
    out.json(&format!("{stage}.log.json"), &log);
    match res {
        Ok(()) => println!("ok {stage} {id} {model}"),
        Err(e) => {
            eprintln!("FAILED {stage} {id} {model}: {e}");
            std::process::exit(1);
        }
    }
}
