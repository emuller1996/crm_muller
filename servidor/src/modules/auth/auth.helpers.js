export const buildUserResponse = (user) => {
  const userData = { ...user };

  delete userData.password;

  return userData;
};