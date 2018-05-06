// determine and color code the pushpins by resultCategory
  // TODO: assign the other category names to the function that we will be using
  function determinePinColor(resultCategory) {
    switch (resultCategory) {
      case "Fast Food Restaurant":
        return "green";
      default:
        return "blue";
    }
  }