

function isValidPhoneNo(phone) {
  const phoneregex = /^\d{10}$/;
  if (phoneregex.test(phone)) {
    return true;
  } else {
    return false;
  }
}

function isValidEmail(email) {
  const emailregex = /[A-Za-z0-9._%+-]+\@[A-Za-z0-9.\+-]+\.[A-Za-z]{2,}/;
  if (emailregex.test(email)) {
    return true;
  } else {
    return false;
  }
}

// function isValidPassword(password) {
//   const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!_+.-])[A-Za-z\d@#$%^&*!_+.-]{8,}$/;
//   if (passwordRegex.test(password)) {
//     return true;
//   } else {
//     return false;
//   }
// }

function isValidPassword(password) {
  const passwordregex = /[A-Za-z0-9.@#$%^&_+*!-]{8,}/;
  if (passwordregex.test(password)) {
    return true;
  } else {
    return false;
  }
}


function isValidDate(date) {
  const dateregex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[0-2])$/;
  if (dateregex.test(date)) {
    return true;
  } else {
    return false;
  }
}

function isValidCharacter(string) {
  const onlycharacter = /^[A-Za-z\s]+$/;
  if (onlycharacter.test(string)) {
    return true;
  } else {
    return false;
  }
}

function isValidDigit(string) {
  const onlydigit = /^\d+$/;
  if (onlydigit.test(string)) {
    return true;
  } else {
    return false;
  }
}
function isvalidurl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false
  }
}
module.exports = {
  isValidCharacter,
  isValidDate,
  isValidDigit,
  isValidEmail,
  isValidPassword,
  isValidPhoneNo,
  isvalidurl
};
