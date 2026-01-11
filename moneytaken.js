import express from 'express';
import { queryPromise } from './utils.js';
const router = express.Router();

const getCongressMembers = (mysql) => queryPromise(mysql, "SELECT id AS cid, name FROM member_congress");
const getLobby = (mysql) => queryPromise(mysql, "SELECT id AS lid, name FROM lobby_group");
const getMoneyTakenFromLobbies = (mysql) => queryPromise(mysql, "SELECT member_congress.name AS congress_member,lobby_group.name AS Lobby, money AS lobby_contributions from member_congress INNER JOIN  money_taken on member_congress.id = money_taken.cid INNER JOIN lobby_group on lobby_group.id = money_taken.lid ORDER BY member_congress.name ASC");

router.get('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const [congressmembers, lobbies, money_taken_lobbies] = await Promise.all([
      getCongressMembers(mysql),
      getLobby(mysql),
      getMoneyTakenFromLobbies(mysql)
    ]);
    res.render('money-taken', { congressmembers, lobbies, money_taken_lobbies, jsscripts: ["deleteentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const { congress: members, lid: lobby } = req.body;

  if (!members || !Array.isArray(members)) {
    return res.status(400).send("Invalid data format for 'congress'.");
  }

  try {
    for (const member of members) {
      const sql = "INSERT INTO money_taken (cid, lid) VALUES (?,?)";
      const inserts = [member, lobby];
      await queryPromise(mysql, sql, inserts);
    }
    res.redirect('/money-taken');
  } catch (err) {
    next(err);
  }
});

router.delete('/lid/:lid/congress/:cid', async (req, res, next) => {
    const mysql = req.app.get('mysql');
    const sql = "DELETE FROM money_taken WHERE cid = ? AND lid = ?";
    const inserts = [req.params.cid, req.params.lid];
    try {
      await queryPromise(mysql, sql, inserts);
      res.status(202).end();
    } catch (err) {
      next(err);
    }
  });

export default router;