export function generateUniqueEmail(minimum: number, maximum: number) {
  function generateRandomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const randomUsername = "datirsachin61";
  return `${randomUsername}+${generateRandomNumber(minimum, maximum)}@stulzservice.com`;
}

export function generateRandomPassword(length: number) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += "Sachin@" + `${charset[randomIndex]}`;
  }

  return password;
}
