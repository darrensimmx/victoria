import {currEmotion} from './facial.js';

let currMood = "";

// Initialize the state of emotions with their corresponding values
let moods = {
    anger: 0.5,
    disgust: 0.5,
    fear: 0.5,
    happy: 0.5,
    sad: 0.5,
    surprise: 0.5,
    neutral: 0, // Neutral doesn't have a value but is used to handle its state
  };

  function logMood(mood, value) {
    // Update the mood value
    if (moods.hasOwnProperty(mood)) {
      moods[mood] = value;
    } else {
      console.log(`Invalid mood: ${mood}`);
    }
  
    // Call the currentMood function to update currMood
    currentMood();
  }
  
  function currentMood() {
    // Find the mood with the highest value in the moods object
    let highestMood = Object.keys(moods).reduce((max, current) => {
      return moods[current] > moods[max] ? current : max;
    });
  
    // Set currMood to the mood with the highest value
    currMood = highestMood;
    console.log(`Current Mood: ${currMood} with value: ${moods[currMood]}`);  // Log the mood with the highest value
  }
  
  function calMood(currentState) {
    // Ensure the state is valid
    const validStates = Object.keys(moods);
    if (!validStates.includes(currentState)) {
      console.error(`Invalid state: ${currentState}`);
      return;
    }
  
    // Update moods based on the current state
    for (const mood in moods) {
      if (currentState === "neutral") {
        // Neutral: All values decrease by 0.05
        moods[mood] = Math.max(0, moods[mood] - 0.05);
      } else if (mood === currentState) {
        // The current state's value increases by 0.1
        moods[mood] = Math.min(1, moods[mood] + 0.1);
      } else {
        // Other states decrease by 0.1
        moods[mood] = Math.max(0, moods[mood] - 0.1);
      }
    }
  
    currentMood();
    // Log the updated moods
    console.log(moods);
    console.log(currMood);
  }

setInterval(() => {
    calMood(currEmotion);
}, 1000);

export {currMood};
  


  // Example usage:
   // Happy increases, others decrease
//   calMood("neutral"); // All values decrease by 0.05
//   calMood("anger"); // Anger increases, others decrease
//   calMood("invalid"); // Invalid state, shows error
