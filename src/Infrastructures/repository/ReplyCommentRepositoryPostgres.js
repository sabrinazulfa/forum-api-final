const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyCommentRepository = require('../../Domains/reply-comment/ReplyCommentRepository');
const AddedReplyComment = require('../../Domains/reply-comment/entities/AddedReplyComment');

class ReplyCommentRepositoryPostgres extends ReplyCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplyComment(userId, commentId, newReplyComment) {
    const { content } = newReplyComment;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `
            INSERT INTO reply
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, content, owner
          `,
      values: [id, content, commentId, userId, false, date],
    };

    const result = await this._pool.query(query);
    return new AddedReplyComment({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner,
    });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT reply.id, reply.date, users.username, reply.is_delete, reply.content
        FROM reply
        INNER JOIN users ON users.id = reply.owner
        WHERE reply.comment_id = $1
        ORDER BY reply.date ASC
        `,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async checkAvailableReply(id) {
    const query = {
      text: 'SELECT * FROM reply WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply not found');
    }
  }

  async deleteReplyById(threadId, commentId, replyId) {
    const query = {
      text: `
        UPDATE reply rc
        SET is_delete = true
        FROM comments cm
        INNER JOIN threads th ON cm.thread_id = th.id
        WHERE rc.comment_id = cm.id
          AND th.id = $1
          AND rc.comment_id = $2
          AND rc.id = $3
      `,
      values: [threadId, commentId, replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT * FROM reply WHERE id = $1 AND owner = $2',
      values: [replyId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('unauthorized, not the owner of reply');
    }
  }
}

module.exports = ReplyCommentRepositoryPostgres;
