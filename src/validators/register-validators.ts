import { checkSchema } from "express-validator";
import commonValidator from "./common-validators";

export default checkSchema(commonValidator);
