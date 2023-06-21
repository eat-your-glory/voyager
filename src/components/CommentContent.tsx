import { Comment, CommentView, Post } from "lemmy-js-client";
import Markdown from "./Markdown";
import { useMemo } from "react";

interface CommentContentProps {
  item: Comment | Post;
}

export default function CommentContent({ item }: CommentContentProps) {
  if (item.deleted) return <i>deleted by creator</i>;
  if (item.removed) return <i>removed by mod</i>;

  const content = useMemo(() => {
    return (
      <Markdown
        components={{
          img: ({ node, ...props }) => (
            <a href={props.src} target="_blank" rel="noopener noreferrer">
              {props.alt || "Image"}
            </a>
          ),
        }}
      >
        {"content" in item ? item.content : item.body ?? item.name}
      </Markdown>
    );
  }, [item]);

  return content;
}