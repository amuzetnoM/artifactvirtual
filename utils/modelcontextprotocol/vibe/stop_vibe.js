#!/usr/bin/env node
import { audioPlayer } from "./build/playback.js";
console.log("Stopping all audio playback...");
audioPlayer.stop();
console.log("Vibe session stopped.");