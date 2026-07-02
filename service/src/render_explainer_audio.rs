// One-off audio backfill — parked for reference, delete once an in-app
// "regenerate audio" action exists. Not part of any module tree, so it is
// not compiled. To run again, move it back to src/bin/ and `cargo run --bin
// render_explainer_audio -- <explanation_id>`.
//
// use app_lib::{
//     app::dialogue::ReferenceKind,
//     db::repo::dialogue::DialoguesRepo,
//     task::tasks::generate_dialogue::audio_renderer::{AudioRenderer, AudioRendererInput},
// };
//
// #[tokio::main]
// async fn main() {
//     dotenvy::dotenv().ok();
//
//     let explanation_id: i64 = std::env::args()
//         .nth(1)
//         .and_then(|s| s.parse().ok())
//         .unwrap_or(1);
//
//     let dialogues = DialoguesRepo::get_for_parent(ReferenceKind::Explanation, explanation_id)
//         .expect("failed to load dialogues for explanation");
//
//     println!(
//         "Rendering audio for {} dialogue(s) in explanation {}",
//         dialogues.len(),
//         explanation_id
//     );
//
//     let renderer = AudioRenderer::new();
//
//     for mut dialogue in dialogues {
//         let id = dialogue.id.expect("dialogue from repo has id");
//         let directory = dialogue
//             .reference
//             .get_directory()
//             .expect("dialogue reference resolves to a directory");
//
//         println!(
//             "  [{}] idx {} — \"{}\" ({} segment(s))",
//             id,
//             dialogue.idx,
//             dialogue.heading,
//             dialogue.segments.len()
//         );
//
//         let rendered = renderer
//             .render(AudioRendererInput {
//                 segments: dialogue.segments,
//                 directory,
//             })
//             .await
//             .expect("audio render failed");
//
//         dialogue.segments = rendered.segments;
//         DialoguesRepo::update(&dialogue).expect("failed to persist dialogue audio");
//         println!("      done");
//     }
//
//     println!("All audio rendered.");
// }
