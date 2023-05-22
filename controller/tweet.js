import * as tweetRep from '../data/tweet.js';
import { getSocketIO } from '../connection/socket.js';

export async function getTweets(req, res, next) {
  const username = req.query.username;
  const tweet = await (username
    ? tweetRep.getAllByUsername(username) //
    : tweetRep.getAll());
  res.status(200).json(tweet);
}

export async function createTweets(req, res) {
  const { text } = req.body;
  const tweet = await tweetRep.create(text, req.userId);
  res.status(201).json(tweet);
  getSocketIO().emit('tweets', tweet);
}

export async function getTweet(req, res) {
  const id = req.params.id;
  const tweet = await tweetRep.getById(id);
  if (tweet) {
    res.status(200).json(tweet);
  } else {
    res.status(404).json({ message: `작성하신 게시글이 없습니다.(:${id})` });
  }
}

export async function updateTweet(req, res) {
  const id = req.params.id;
  const text = req.body.text;

  const tweet = await tweetRep.getById(id);
  if (!tweet) {
    return res.sendStatus(404);
  }
  if (tweet.userId !== req.userId) {
    return res.sendStatus(403);
  }

  const updated = await tweetRep.update(id, text);
  res.status(200).json(updated);
}

export async function deleteTweet(req, res) {
  const id = req.params.id;

  const tweet = await tweetRep.getById(id);
  if (!tweet) {
    return res.sendStatus(404);
  }
  if (tweet.userId !== req.userId) {
    return res.sendStatus(403);
  }

  await tweetRep.remove(id);
  res.sendStatus(204);
}
