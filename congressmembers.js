import express from 'express';
import { queryPromise } from './utils.js';
const router = express.Router();

const getCongressMembers = (mysql) => queryPromise(mysql, "SELECT id, name FROM member_congress");
const getLobbyGroup = (mysql) => queryPromise(mysql, "SELECT lobby_group.id AS Lobby_id, lobby_group.name AS Lobby, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id");
const getOneCongressMember = (mysql, id) => queryPromise(mysql, "SELECT name FROM member_congress WHERE id = ?", [id]);
const getMemberWithNameLike = (mysql, name) => {
  const query = "SELECT name FROM member_congress WHERE name LIKE " + mysql.pool.escape(name + '%');
  return queryPromise(mysql, query);
};

router.get('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const [congressMembers, lobbies] = await Promise.all([
      getCongressMembers(mysql),
      getLobbyGroup(mysql)
    ]);
    res.render('congress', {
      congressMembers,
      lobbies,
      jsscripts: ["deleteentity.js", "searchmember.js", "updateentity.js"]
    });
  } catch (err) {
    next(err);
  }
});

router.get('/search/:s', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const [congressMembers, lobbies] = await Promise.all([
      getMemberWithNameLike(mysql, req.params.s),
      getLobbyGroup(mysql)
    ]);
    res.render('congress', {
      congressMembers,
      lobbies,
      jsscripts: ['deleteentity.js', 'searchmember.js', 'updateentity.js']
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const results = await getOneCongressMember(mysql, req.params.id);
    const oneCongressMember = results[0];
    res.render('update-congress', { oneCongressMember, jsscripts: ["updateentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const { monies, id: congressId } = req.body;

  if (!monies || !Array.isArray(monies)) {
    return res.status(400).send("Invalid data format for 'monies'.");
  }

  try {
    for (const money of monies) {
      const sql = "INSERT INTO money_taken (cid, lid) VALUES (?, ?)";
      const inserts = [congressId, money];
      await queryPromise(mysql, sql, inserts);
    }
    res.redirect('/money-taken');
  } catch (err) {
    console.error("Error inserting money_taken records:", err);
    next(err);
  }
});


router.delete('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "DELETE FROM member_congress WHERE id = ?";
  const inserts = [req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(202).end();
  } catch (err) {
    next(err);
  }
});

export default router;