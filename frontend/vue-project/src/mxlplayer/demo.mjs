import * as MusicXMLPlayer from "./distmxl/musicxml-player.esm.js";
import { TimingObject } from "./distmxl/timing-object.esm.js";
import { ref } from "vue";

const DEFAULT_OUTPUT = "local";
const PLAYER_PLAYING = 1;
const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
const notes2 = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const LOCALSTORAGE_KEY = "musicxml-player";
const challenge = ref(false);
const pitchShow = ref();
export const num = ref([]);

const g_state = {
  webmidi: null,
  player: null,
  params: null,
  musicXml: null,
  options: {
    unroll: false,
    horizontal: true,
    mute: false,
  },
  timingObject: null,
};

export async function createPlayer(muteCheck) {
  // Destroy previous player.
  g_state.player?.destroy();
  g_state.options.mute = muteCheck ? true : false;
  // Set the player parameters.
  const options = g_state.options;

  // Reset UI elements.
  document.getElementById("velocity").value = 1;

  // Create new player.
  if (g_state.musicXml) {
    try {
      const player = await MusicXMLPlayer.Player.load({
        musicXml: g_state.musicXml,
        container: "sheet-container",
        renderer: createRenderer(options),
        output: createOutput("local"),
        converter: await createConverter(),
        unroll: options.unroll,
        timingsrc: g_state.timingObject,
        mute: options.mute,
      });
      // Save the state and player parameters.
      g_state.player = player;
      g_state.options = options;
      try {
        window.localStorage.setItem(
          LOCALSTORAGE_KEY,
          JSON.stringify({
            params: [...g_state.params.entries()],
            options: g_state.options,
          })
        );
      } catch (error) {
        console.warn(`Error saving player state: ${error}`);
      }
    } catch (error) {
      console.error(error);
      document.getElementById("error").textContent =
        "Error creating player. Please try another setting.";
    }
  }
}

function createRenderer(options) {
  return new MusicXMLPlayer.VerovioRenderer(
    {
      breaks: options.horizontal ? "none" : "smart",
      spacingNonLinear: options.horizontal ? 1.0 : undefined,
      spacingLinear: options.horizontal ? 0.1 : undefined,
      fingeringScale: 0.6,
      justificationBracketGroup: 5,
      scale: 60,
      header: "none",
    },
    {
      scrollOffset: 100,
    }
  );
}

async function createConverter() {
  const candidates = [
    {
      converter: new MusicXMLPlayer.VerovioConverter(),
      id: "converter-vrv",
      priority: 1,
    },
  ];

  const chosen = candidates.reduce((chosen, candidate) => {
    if (!chosen || chosen.priority < candidate.priority) {
      return candidate;
    }
    return chosen;
  }, null);

  return chosen.converter;
}

function createOutput(output) {
  if (g_state.webmidi) {
    return (
      Array.from(g_state.webmidi.outputs.values()).find(
        (o) => o.id === output
      ) ?? null
    );
  }
  return null;
}

function handlePlayPauseKey(e) {
  e.stopPropagation();
  if (!challenge.value && e.key === " " && g_state.player) {
    if (g_state.player.state === PLAYER_PLAYING) {
      g_state.timingObject?.update({ velocity: 0 });
      if (pitchShow.value) {
        clearInterval(pitchShow.value);
      }
    } else {
      g_state.timingObject?.update({
        velocity: Number(document.getElementById("velocity")?.value),
      });
      pitchShow.value = setInterval(() => {
        currPitch();
      }, 100);
    }
  }
}

export async function sheetSelect(input) {
  if (!input) return;
  // const sheet = input;
  try {
    // const musicXml = await (await MusicXMLPlayer.fetish(sheet)).arrayBuffer();
    g_state.musicXml = input;
    g_state.params.set("sheet", "mxl-Player");
  } catch (error) {
    console.error(`Failed to load sheet ${sheet}: ${error}`);
  }
}

function handleOptionChange(e) {
  g_state.options.mute = e.target.checked;
  g_state.player.changeMute(g_state.options.mute);
}

function handleVelocityChange(e) {
  if (g_state.player.state === PLAYER_PLAYING) {
    g_state.timingObject?.update({
      velocity: Number(document.getElementById("velocity").value),
    });
  }
}

export async function pageLoad() {
  // Load the parameters from local storage and/or the URL.
  const params = new URLSearchParams(document.location.search);
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY));
    g_state.params = new URLSearchParams([
      ...stored.params,
      ...[...params.entries()],
    ]);
    g_state.options = stored.options;
  } catch {
    g_state.params = params;
  }
  g_state.params["output"] = DEFAULT_OUTPUT; // Too complicated to wait for MIDI output

  document.querySelectorAll(".velo").forEach((e) => {
    e.addEventListener("click", handleVelocityChange);
  });
  document.querySelectorAll(".player-option").forEach((element) => {
    element.addEventListener("change", handleOptionChange);
  });
  window.addEventListener("keydown", handlePlayPauseKey);

  // Initialize Web MIDI.
  if (navigator.requestMIDIAccess)
    navigator.requestMIDIAccess().then(
      (webmidi) => {
        g_state.webmidi = webmidi;
      },
      (error) => {
        console.error(error);
        populateMidiOutputs();
      }
    );

  // Create the TimingObject.
  g_state.timingObject = new TimingObject();
  g_state.params.set("output", "local");
}

export function currPitch() {
  const currPlayer = g_state.player;
  if (
    currPlayer &&
    num.value.toString() !== currPlayer._renderer._notes.toString()
  ) {
    const arr = new Array();
    currPlayer._renderer._notes.forEach((e) => {
      const i = g_state.player._renderer._vrv.getMIDIValuesForElement(e).pitch;
      if (i) {
        const o = Math.floor((i - 9) / 12);
        const k = (i - 9) % 12;
        arr.push(o.toString() + notes[k]);
      }
    });
    num.value = [...arr];
  }
}

export function reset() {
  g_state.player?._midiPlayerStop();
  g_state.player = null;
  window.localStorage.removeItem(LOCALSTORAGE_KEY);
}

export const osmd = async function (container, musicXml) {
  const k = new MusicXMLPlayer.OpenSheetMusicDisplayRenderer();
  const options = {
    backend: "svg",
    drawFromMeasureNumber: 1,
    drawUpToMeasureNumber: Number.MAX_SAFE_INTEGER, // draw all measures, up to the end of the sample
    drawMeasureNumbers: false,
    newSystemFromXML: false,
    newPageFromXML: false,
    followCursor: true,
    disableCursor: false,
    autoResize: false,
    drawMetronomeMarks: false,
    pageFormat: "Letter P",
    drawingParameters: "preview",
  };
  await k.load(container, musicXml, options);
};

export const chaingingChallenge = function (state) {
  challenge.value = state;
};

export const stateChange = function (state) {
  if (state === "play") {
    g_state.timingObject?.update({
      velocity: Number(document.getElementById("velocity").value),
    });
    pitchShow.value = setInterval(() => {
      currPitch();
    }, 100);
  } else if (state === "pause") {
    g_state.timingObject?.update({ velocity: 0 });
    if (pitchShow.value) {
      clearInterval(pitchShow.value);
    }
  } else if (state === "rewind") {
    g_state.timingObject?.update({ position: 0, velocity: 0 });
    if (pitchShow.value) {
      clearInterval(pitchShow.value);
    }
  }
};

export const isMidiStop = function () {
  if (!g_state.player._midiPlayer._state) {
    return true;
  } else {
    return false;
  }
};

export const playingPiano = function (pitch, oct) {
  let k = 60;
  notes2.forEach((e, i) => {
    if (e === pitch) {
      k = i + (oct + 1) * 12;
    }
  });

  g_state.player._output._player.queueWaveTable(
    g_state.player._output._audioContext,
    g_state.player._output._audioContext._destination,
    window[g_state.player._output._instruments[0].instrumentInfo.variable],
    0,
    k,
    0.5
  );
};

export default {
  pageLoad,
  sheetSelect,
  createPlayer,
  num,
  reset,
  osmd,
  chaingingChallenge,
  stateChange,
  isMidiStop,
  playingPiano,
  currPitch,
};
