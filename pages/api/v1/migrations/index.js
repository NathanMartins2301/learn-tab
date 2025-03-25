import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { createRouter } from "next-connect";
import controller from "infra/controller";

const router = createRouter();

export default router.handler(controller.errorHandlers);

router.use(connectDB).get(getHandler);
router.use(connectDB).post(postHandler);

async function connectDB(req, res, next) {
  try {
    req.dbClient = await database.getNewClient();
    req.defaultMigrationOptions = {
      dbClient: req.dbClient,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };
    next();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getHandler(req, res) {
  try {
    const pendingMigrations = await migrationRunner(
      req.defaultMigrationOptions,
    );
    return res.status(200).json(pendingMigrations);
  } finally {
    req.dbClient?.end();
  }
}

async function postHandler(req, res) {
  try {
    const migratedMigrations = await migrationRunner({
      ...req.defaultMigrationOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return res.status(201).json(migratedMigrations);
    }
    return res.status(200).json(migratedMigrations);
  } finally {
    await req.dbClient?.end();
  }
}
