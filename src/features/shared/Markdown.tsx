import {
  ReactMarkdown,
  ReactMarkdownOptions,
} from "react-markdown/lib/react-markdown";
import Img from "../post/detail/Img";
import styled from "@emotion/styled";
import remarkGfm from "remark-gfm";

const Blockquote = styled.blockquote`
  padding-left: 0.5rem;
  border-left: 3px solid var(--ion-color-light);
  margin-left: 0;
`;

const Code = styled.code`
  white-space: pre-wrap;
`;

export default function Markdown(props: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      linkTarget="_blank"
      {...props}
      components={{
        img: (props) => <Img {...props} onClick={(e) => e.stopPropagation()} />,
        blockquote: (props) => <Blockquote {...props} />,
        code: (props) => <Code {...props} />,
        ...props.components,
      }}
      remarkPlugins={[remarkGfm]}
    />
  );
}