import express from 'express';
import { queryPromise } from './utils.js';
const router = express.Router();

const getBills = (mysql) => queryPromise(mysql, "SELECT id, name, description, passed FROM bill");
const getOneBill = (mysql, id) => queryPromise(mysql, "SELECT id, name, description, passed FROM bill WHERE id = ?", [id]);

router.get('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const bills = await getBills(mysql);
    res.render('bill', { bills, jsscripts: ["js/bill.js"] });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  try {
    const results = await getOneBill(mysql, req.params.id);
    const onebill = results[0];
    res.render('update-bill', { onebill, jsscripts: ["updateentity.js"] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "UPDATE bill SET name=?, description=? WHERE id=?";
  const inserts = [req.body.name, req.body.description, req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "INSERT INTO bill (name, description) VALUES (?,?)";
  const inserts = [req.body.name, req.body.description];
  try {
    const result = await queryPromise(mysql, sql, inserts);
    const newBill = await getOneBill(mysql, result.insertId);
    res.json(newBill[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const mysql = req.app.get('mysql');
  const sql = "DELETE FROM bill WHERE id = ?";
  const inserts = [req.params.id];
  try {
    await queryPromise(mysql, sql, inserts);
    res.status(202).end();
  } catch (err) {
    next(err);
  }
});

export default router;