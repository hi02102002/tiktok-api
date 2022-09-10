export const getTokenAuthorization = (authorization: string) => {
   let token: string | undefined = undefined;

   if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1];
   }
   return token;
};
