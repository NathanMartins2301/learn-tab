import database from "infra/database";
import { ValidationError } from "infra/errors.js";

async function create(userInputValue) {
  await validateUniqueEmail(userInputValue.email);
  await validateUniqueUsername(userInputValue.username);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: ` 
        SELECT  
          email
        FROM 
          users
        WHERE 
          LOWER(email) = LOWER($1)
        ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já esta sendo utilizado",
        action: "Utilize outro email para realizar o cadastro",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const result = await database.query({
      text: ` 
        SELECT  
          username
        FROM 
          users
        WHERE 
          LOWER(username) = LOWER($1)
        ;`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já esta sendo utilizado",
        action: "Utilize outro username para realizar o cadastro",
      });
    }
  }

  async function runInsertQuery(userInputValue) {
    const result = await database.query({
      text: ` 
      INSERT INTO 
        users (username, email, password)
      VALUES 
        ($1, $2, $3)
      RETURNING 
        *
      ;`,
      values: [
        userInputValue.username,
        userInputValue.email,
        userInputValue.password,
      ],
    });
    return result.rows[0];
  }
}

const user = {
  create,
};

export default user;
