import express from 'express';
import bodyParser from 'body-parser';
import { create } from 'express-handlebars';
import dotenv from 'dotenv';

import pool from './dbcon.js';
import billRouter from './bill.js';
import congressRouter from './congressmembers.js';
import lobbyRouter from './lobbygroups.js';
import moneyTakenRouter from './moneytaken.js';
import presidentRouter from './president.js';
import { queryPromise } from './utils.js';

dotenv.config();

const app = express();
const handlebars = create({
  defaultLayout: 'main'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4099);

const mysql = { pool };
app.set('mysql', mysql);

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));

app.use('/bill', billRouter);
app.use('/congress', congressRouter);
app.use('/lobby', lobbyRouter);
app.use('/money-taken', moneyTakenRouter);
app.use('/president', presidentRouter);
app.use('/', express.static('public'));

const getBills = () => queryPromise(mysql, "SELECT id, name, description, passed FROM bill");
const getLobbyGroup = () => queryPromise(mysql, "SELECT lobby_group.id, lobby_group.name, money, bill.name AS bill_endorsed FROM lobby_group INNER JOIN bill ON bill_endorsed = bill.id");
const getPresident = () => queryPromise(mysql, "SELECT id, name, signed, bill_on_desk FROM president");
const getCongressMembers = () => queryPromise(mysql, "SELECT id, name FROM member_congress");

app.get('/alldata', async (req, res, next) => {
  try {
    const [bills, lobbies, president, congressMembers] = await Promise.all([
      getBills(),
      getLobbyGroup(),
      getPresident(),
      getCongressMembers()
    ]);
    res.render('alldata', { bills, lobbies, president, congressMembers });
  } catch (err) {
    next(err);
  }
});

const getCongressVoting = () => {
  const sql = "SELECT cid, member_congress.name AS congress_member, bill.name AS Bill, bill.description AS description , vote.vote AS Vote from member_congress INNER JOIN  vote on member_congress.id = vote.cid INNER JOIN bill on bill.id = vote.bid  ORDER BY member_congress.name ASC";
  return queryPromise(mysql, sql);
};

app.get('/voting', async (req, res, next) => {
  try {
    const voting = await getCongressVoting();
    res.render('voting', { voting });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404);
  res.render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), () => {
  console.log(`Express started on http://flip3.engr.oregonstate:${app.get('port')}`);
});
