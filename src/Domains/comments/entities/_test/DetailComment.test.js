const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      date: '2024-12-11T22:15:46.323Z',
      content: 'Good Job!',
      replies: [],
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-456',
      date: '2024-12-11T22:15:46.323Z',
      content: 123,
      replies: [],
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DetailComment object correctly when isDeleted is false', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-456',
      date: '2024-12-11T22:15:46.323Z',
      content: 'Good Job!',
      replies: [],
      isDelete: false,
    };

    const {
      id, username, date, content, replies,
    } = new DetailComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(replies).toEqual(payload.replies);
  });

  it('should create CommentDetail object correctly when isDeleted is true', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-456',
      date: '2024-12-11T22:15:46.323Z',
      content: 'Good Job!',
      replies: [],
      isDelete: true,
    };

    const {
      id, username, date, content, replies,
    } = new DetailComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(replies).toEqual(payload.replies);
  });

  it('should set replies to empty array when replies property is not provided', () => {
    const payload = {
      id: 'comment-123',
      username: 'user-456',
      date: '2024-12-11T22:15:46.323Z',
      content: 'comment yang bagus!',
    };

    const { replies } = new DetailComment(payload);

    expect(replies).toStrictEqual([]);
  });

  it('should remap content correctly based on isDelete value', () => {
    const payloadWithDeleteTrue = {
      id: 'comment-123',
      username: 'user-456',
      date: '2024-12-11T22:15:46.323Z',
      content: 'Komen ini telah dihapus',
      replies: [],
      isDelete: true,
    };

    const payloadWithDeleteFalse = {
      id: 'comment-123',
      username: 'user-456',
      date: '2024-12-11T22:15:46.323Z',
      content: 'komen ini tersembunyi',
      replies: [],
      isDelete: false,
    };

    const deletedComment = new DetailComment(payloadWithDeleteTrue);
    const visibleComment = new DetailComment(payloadWithDeleteFalse);

    expect(deletedComment.content).toEqual('**komentar telah dihapus**');
    expect(visibleComment.content).toEqual(payloadWithDeleteFalse.content);
  });
});
