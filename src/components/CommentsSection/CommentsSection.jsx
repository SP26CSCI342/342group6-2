import { useState, useEffect } from "react";
import "./CommentsSection.css";

function StarRating({ value, onChange, readOnly }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? "filled" : ""} ${readOnly ? "readonly" : "interactive"}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CommentsSection({ gameName }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("User") || "null");

  useEffect(() => {
    fetchComments();
  }, [gameName]);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/game/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName }),
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !message.trim() || rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, gameName: gameName, message: message.trim(), rating}),
      });
      if (res.ok) {
        setMessage("");
        setRating(0);
        await fetchComments();
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="comments-section">
      <h3 className="comments-heading">Comments</h3>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-textarea"
            placeholder="Share your thoughts about this game..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <div className="comment-form-footer">
            <StarRating value={rating} onChange={setRating} />
            <button
              type="submit"
              className="post-button"
              disabled={submitting || !message.trim() || rating === 0}
            >
              ✈ Post Comment
            </button>
          </div>
        </form>
      ) : (
        <p className="comments-login-prompt">
          <a href="/login">Log in</a> to leave a comment.
        </p>
      )}

      {loading ? (
        <p className="comments-status">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="comments-status">No comments yet. Be the first!</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment, i) => (
            <div className="comment-card" key={i}>
              <div className="comment-header">
                <span className="comment-username">{comment.username}</span>
                <StarRating value={comment.rating} readOnly />
                <span className="comment-date">{formatDate(comment.postTime)}</span>
              </div>
              <p className="comment-message">{comment.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
