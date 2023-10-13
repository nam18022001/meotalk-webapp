const createKeyWords = (email: string) => {
  var keywords = [];

  if (email) {
    for (let letter = 0; letter < email.length; letter++) {
      keywords.push(email.slice(0, letter + 1));
    }
    return keywords;
  }
};

export default createKeyWords;
