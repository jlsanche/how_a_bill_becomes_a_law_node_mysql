import express from 'express';
import { queryPromise } from './utils.js';
const router = express.Router();

const getCongressMembers = (mysql) => queryPromise(mysql, "SELECT id, name FROM member_congress");
const getLobbyGroup = (mysql) => queryPromise(mysql, "SELECT lobby_group.id AS Lobby_id, lobby_group.name AS Lobby, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id");
const getOneCongressMember = (mysql, id) => queryPromise(mysql, "SELECT id, name FROM member_congress WHERE id = ?", [id]);
const getMemberWithNameLike = (mysql, name) => {
  const query = "SELECT id, name FROM member_congress WHERE name LIKE ?";
  const inserts = [name + '%'];
  return queryPromise(mysql, query, inserts);
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
      jsscripts: ["js/congress.js", "searchmember.js", "updateentity.js"]
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
  const sql = "INSERT INTO member_congress (name) VALUES (?)";
  const inserts = [req.body.name];
  try {
    const result = await queryPromise(mysql, sql, inserts);
    const newMember = await getOneCongressMember(mysql, result.insertId);
    res.json(newMember[0]);
  } catch (err) {
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