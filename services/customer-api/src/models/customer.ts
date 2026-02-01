export type Customer = {
  _id?: string;           // Mongo will store ObjectId; we return string
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};
