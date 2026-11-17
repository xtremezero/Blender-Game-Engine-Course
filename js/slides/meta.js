/* ============================================================
   Curriculum metadata — parts, chapters, and the slide registry.
   Chapter files push slide objects into SLIDES:
     { ch: <chapterNumber>, t: "<title>", k: "<kind|omitted>", h: "<body html>" }
   Kinds: "cover" (course cover), "divider" (part opener),
          "chapter" (chapter title slide), omitted = content slide.
   ============================================================ */

const PARTS = {
  1: { label: "Part I",   title: "Foundations & Quickstart" },
  2: { label: "Part II",  title: "Beginner & Intermediate Tutorials" },
  3: { label: "Part III", title: "Advanced Systems & Projects" },
  4: { label: "Part IV",  title: "Reference & Appendix" },
};

const CHAPTERS = {
  1:  { p: 1, t: "Foreword",                          s: "About This Book" },
  2:  { p: 1, t: "Quickstart",                        s: "Simple Face Mapping & 2D Applications" },
  3:  { p: 1, t: "Introduction to 3D & Game Engines", s: "Concepts, Terminology & Architecture" },
  4:  { p: 1, t: "Blender Basics",                    s: "Interface, Navigation, Editing & Preferences" },
  5:  { p: 2, t: "Pumpkin Run",                       s: "Environment, Materials, Interactivity, Light, Animation, Sound" },
  6:  { p: 2, t: "Tube Cleaner",                      s: "Model Loading, Gun Controls, Movement, Shooting & Enemy Logic" },
  7:  { p: 2, t: "Pinball",                           s: "Bumper Mechanics & Sewer Elements" },
  8:  { p: 2, t: "SubRacer",                          s: "Sensors, Controllers, Actuators, Power-ups & GLSL Mist" },
  9:  { p: 3, t: "Blender Basic Network Setup",       s: "Server / Client Implementation" },
  10: { p: 3, t: "Game Character Animation",          s: "Bones, Skinning, Weight Editing, Actions & Game Logic" },
  11: { p: 3, t: "Flying Buddha",                     s: "Memory Game, Logic Bricks & the Shuffle Python Script" },
  12: { p: 3, t: "Yo Frankie!",                       s: "The Open Game Project — Licensing, States, Levels, Split-screen" },
  13: { p: 4, t: "The BGE Reference",                 s: "Materials, Lamps, UV, Logic, Physics, Sound, Python, Performance" },
  14: { p: 4, t: "Appendix",                          s: "Installation, Support, Foundation, Community & Glossary" },
};

const SLIDES = [];
