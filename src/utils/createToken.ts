import jwt from 'jsonwebtoken';

const createToken = (
   id: string,
   privateKey: string,
   expiresIn: string | number
) => {
   const token = jwt.sign({ id }, privateKey, {
      expiresIn,
   });

   return token;
};

export default createToken;
