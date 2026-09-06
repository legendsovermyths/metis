//! TikZ snippet templates for each annotation type.
//!
//! Layout invariant: the **text** of every anchored annotation (label,
//! sidenote, callout) lives in a gutter outside the figure footprint — left
//! or right, one tidy column per side. **Connecting arrows and ticks may
//! cross onto the figure** to link the gutter slot back to its target.
//!
//! Positioning model (TikZ-native):
//!
//! - The `\gid{id}{body}` macro wraps every gid in a `local bounding box=
//!   gid-<id>` scope, so any element by id can be referenced as e.g.
//!   `(gid-binomial-formula.east)` from later TikZ code.
//! - `COORDINATE_SAVE` records the figure's east and west edges as
//!   `fig-east` / `fig-west` right after the base figure compiles, so the
//!   gutter x stays put even as later additions extend the bbox.
//! - Anchored slots are positioned as `($(fig-east|-gid-target.north) +
//!   (28pt, yshift)$)` — gutter x, target's y, plus a Rust-computed yshift
//!   for overflow push-down. Slot anchor is `north west` (or `north east`
//!   on the left gutter) so the slot's top aligns with the target's top.
//! - Standalone snippets (header, footer, did-you-know) anchor to
//!   `current bounding box.north/south`, which TikZ re-evaluates per node,
//!   so they re-center as the canvas grows.

const GUTTER_OFFSET_PT: f64 = 28.0;

/// Saves figure-edge coordinates so anchored templates don't restart from a
/// growing bbox. Spliced once at the start of the additions block.
pub const COORDINATE_SAVE: &str = "\\coordinate (fig-east) at (current bounding box.east);\n\
                                   \\coordinate (fig-west) at (current bounding box.west);";

/// Header above the figure, centered on the current bounding box.
pub fn header(text: &str) -> String {
    format!(
        "\\node[anchor=south, font=\\bfseries\\large, align=center] \
         at ([yshift=14pt]current bounding box.north) {{{text}}};",
    )
}

/// Footer below the figure, centered on the current bounding box.
pub fn footer(text: &str) -> String {
    format!(
        "\\node[anchor=north, font=\\itshape\\small, align=center, text width=10cm] \
         at ([yshift=-12pt]current bounding box.south) {{{text}}};",
    )
}

/// Boxed "Did you know?" note beneath everything else, centered.
pub fn did_you_know(text: &str) -> String {
    format!(
        "\\node[anchor=north, draw, rounded corners, inner sep=6pt, text width=9cm, \
         align=center, font=\\small] \
         at ([yshift=-16pt]current bounding box.south) \
         {{\\textbf{{Did you know?}}\\\\[2pt]{text}}};",
    )
}

/// Sidenote — italic small text in the gutter slot. No connector.
pub fn sidenote(slot_name: &str, target_gid: &str, on_right: bool, yshift_pt: f64, text: &str) -> String {
    let (anchor, edge, dx) = gutter_params(on_right);
    format!(
        "\\node[name={slot_name}, anchor={anchor}, font=\\itshape\\small, align=left, text width=3.5cm] \
         at ($({edge} |- gid-{target_gid}.north) + ({dx:.1}pt, {ys:.1}pt)$) {{{text}}};",
        ys = yshift_pt,
    )
}

/// Callout — text in the gutter slot plus a curved arrow from the target's
/// near edge to the slot's near edge.
pub fn callout(slot_name: &str, target_gid: &str, on_right: bool, yshift_pt: f64, text: &str) -> String {
    let (anchor, edge, dx) = gutter_params(on_right);
    let target_side = if on_right { "east" } else { "west" };
    let slot_side = if on_right { "west" } else { "east" };
    let (out_angle, in_angle) = if on_right { (0, 180) } else { (180, 0) };
    format!(
        "\\node[name={slot_name}, anchor={anchor}, font=\\small, align=left, text width=3.5cm] \
            at ($({edge} |- gid-{target_gid}.north) + ({dx:.1}pt, {ys:.1}pt)$) {{{text}}};\n\
         \\draw[-{{Stealth[length=4pt]}}, thin] \
            (gid-{target_gid}.{target_side}) \
            to[out={out_angle}, in={in_angle}] \
            ({slot_name}.{slot_side});",
        ys = yshift_pt,
    )
}

/// Label — short bold tag in the gutter slot, with a thin straight tick
/// from the target's near edge to the slot.
pub fn label(slot_name: &str, target_gid: &str, on_right: bool, yshift_pt: f64, text: &str) -> String {
    let (anchor, edge, dx) = gutter_params(on_right);
    let target_side = if on_right { "east" } else { "west" };
    let slot_side = if on_right { "west" } else { "east" };
    format!(
        "\\node[name={slot_name}, anchor={anchor}, font=\\footnotesize\\bfseries] \
            at ($({edge} |- gid-{target_gid}.north) + ({dx:.1}pt, {ys:.1}pt)$) {{{text}}};\n\
         \\draw[thin] (gid-{target_gid}.{target_side}) -- ({slot_name}.{slot_side});",
        ys = yshift_pt,
    )
}

fn gutter_params(on_right: bool) -> (&'static str, &'static str, f64) {
    if on_right {
        ("north west", "fig-east", GUTTER_OFFSET_PT)
    } else {
        ("north east", "fig-west", -GUTTER_OFFSET_PT)
    }
}
