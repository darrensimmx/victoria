

window.currMood = "";

// Initialize the state of emotions with their corresponding values
let moods = {
    anger: 0.5,
    disgust: 0.5,
    fear: 0.5,
    happy: 0.5,
    sad: 0.5,
    surprised: 0.5,
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
  
  window.currMood = "";
  function currentMood() {
    let highestMood = Object.keys(moods).reduce((max, current) => {
        return moods[current] > moods[max] ? current : max;
    });

    if (window.currMood !== highestMood) { // Log only when mood changes
        console.log(`Mood changed from ${window.currMood} to ${highestMood}`);
    }

    window.currMood = highestMood; // Update global mood variable
}

  
function calMood(currentState) {
  if (!Object.keys(moods).includes(currentState)) {
      console.error(`Invalid emotion detected: ${currentState}`);
      return;
  }

  // Update moods and log results
  for (let mood in moods) {
      moods[mood] = (mood === currentState)
          ? Math.min(1, moods[mood] + 0.1)
          : Math.max(0, moods[mood] - 0.1);
  }
  currentMood();
  console.log("Updated Moods:", moods);
}


setInterval(() => {
    calMood(window.currEmotion);
}, 1000);


  


  // Example usage:
   // Happy increases, others decrease
//   calMood("neutral"); // All values decrease by 0.05
//   calMood("anger"); // Anger increases, others decrease
//   calMood("invalid"); // Invalid state, shows error
