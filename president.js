import express from 'express';
import { queryPromise } from './utils.js';
const router = express.Router();

const getPresident = (mysql) => queryPromise(mysql, "SELECT id, name, signed, bill_on_desk FROM president");
const getBillDetails = (mysql) => queryPromise(mysql, "SELECT president.id, president.name AS president, bill_on_desk, signed, bill.name AS bill_name, bill.description AS bill_desc FROM president INNER JOIN bill ON bill.id = president.id");
const getOnePres = (mysql, id) => queryPromise(mysql, "SELECT id, name, signed, bill_on_desk FROM president WHERE id = ?", [id]);

router.get('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const [president, details] = await Promise.all([
      getPresident(mysql),
      getBillDetails(mysql)
    ]);
    res.render('president', { president, details, jsscripts: ["deleteentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const results = await getOnePres(mysql, req.params.id);
    const onepres = results[0];
    res.render('update-president', { onepres, jsscripts: ["updateentity.js", " deleteentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "INSERT INTO president(name, signed, bill_on_desk) VALUES (?,?,?)";
  const inserts = [req.body.name, req.body.signed, req.body.bill_endorsed];
  try {
    await queryPromise(mysql, sql, inserts);
    res.redirect('/president');
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "UPDATE president SET signed =? WHERE id=?";
  const inserts = [req.body.signed, req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "DELETE FROM president WHERE id = ?";
  const inserts = [req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(202).end();
  } catch (err) {
    next(err);
  }
});

export default router;