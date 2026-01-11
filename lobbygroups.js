import express from 'express';
import { queryPromise } from './utils.js';
const router = express.Router();

const getLobbyGroup = (mysql) => queryPromise(mysql, "SELECT lobby_group.id, lobby_group.name, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id");
const getBills = (mysql) => queryPromise(mysql, "SELECT bill.id AS bill_endorsed, bill.name AS bill_name, bill.description,lobby_group.id AS Lobby FROM bill INNER JOIN lobby_group ON bill.id = lobby_group.id");
const getOneLobbyGroup = (mysql, id) => queryPromise(mysql, "SELECT lobby_group.id, lobby_group.name, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id WHERE lobby_group.id = ?", [id]);

router.get('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const [lobbies, bills] = await Promise.all([
      getLobbyGroup(mysql),
      getBills(mysql)
    ]);
    res.render('lobby', { lobbies, bills, jsscripts: ["js/lobby.js", "updateentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const results = await getOneLobbyGroup(mysql, req.params.id);
    const oneLobbyGroup = results[0];
    res.render('update-lobby', { oneLobbyGroup, jsscripts: ["updateentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "INSERT INTO lobby_group (name, money, bill_endorsed) VALUES (?,?,?)";
  const inserts = [req.body.name, req.body.money, req.body.bill_endorsed];
  try {
    const result = await queryPromise(mysql, sql, inserts);
    const newLobby = await getOneLobbyGroup(mysql, result.insertId);
    res.json(newLobby[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "UPDATE lobby_group SET name=?, money=? WHERE id=?";
  const inserts = [req.body.name, req.body.money, req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "DELETE FROM lobby_group WHERE id = ?";
  const inserts = [req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(202).end();
  } catch (err) {
    next(err);
  }
});

export default router;