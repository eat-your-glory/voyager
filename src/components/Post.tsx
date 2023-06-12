import styled from "@emotion/styled";
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonRouterLink,
  ItemSlidingCustomEvent,
} from "@ionic/react";
import { PostView } from "lemmy-js-client";
import markdownToTxt from "markdown-to-txt";
import {
  arrowDownSharp,
  arrowUpSharp,
  ellipsisHorizontal,
} from "ionicons/icons";
import PreviewStats from "./PreviewStats";
import Embed from "./Embed";
import { useMemo, useRef, useState } from "react";
import { css } from "@emotion/react";
import { findLoneImage } from "../helpers/markdown";
import { useParams } from "react-router";

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
  padding: 1rem;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 10px;
`;

const UpvoteArrow = styled(IonIcon)<{ willUpvote: boolean }>`
  font-size: 2rem;
  width: 80px;

  opacity: 0.5;

  ${({ willUpvote }) =>
    willUpvote &&
    css`
      opacity: 1;
    `}
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 0.8em;
  color: var(--ion-color-medium);
`;

const LeftDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RightDetails = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 1.5rem;
`;

const CommunityDetails = styled.div`
  display: flex;
  align-items: center;

  gap: 0.5rem;

  color: var(--ion-color-medium);
  text-decoration: none;
`;

const CommunityName = styled.div`
  max-width: 10rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostBody = styled.div`
  font-size: 0.8em !important;
  line-height: 1.3;
  opacity: 0.5;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostImage = styled.img`
  margin: 0 -1rem;
  width: calc(100% + 2rem);
  max-width: none;
`;

interface PostProps {
  post: PostView;

  /**
   * Hide the community name, show author name
   */
  communityMode?: boolean;
}

export default function Post({ post, communityMode }: PostProps) {
  const { actor } = useParams<{ actor: string }>();
  const [willUpvote, setWillUpvote] = useState(false);
  const dragRef = useRef<ItemSlidingCustomEvent | undefined>();
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );
  function renderPostBody() {
    if (
      post.post.url &&
      (post.post.url.endsWith(".jpeg") ||
        post.post.url.endsWith(".png") ||
        post.post.url.endsWith(".gif"))
    ) {
      return <PostImage src={post.post.url} />;
    }

    if (markdownLoneImage)
      return (
        <PostImage
          src={markdownLoneImage.url}
          alt={markdownLoneImage.altText}
        />
      );

    if (post.post.thumbnail_url && post.post.url) {
      return <Embed post={post} />;
    }

    if (post.post.body) {
      return <PostBody>{markdownToTxt(post.post.body)}</PostBody>;
    }

    if (post.post.url) {
      return <Embed post={post} />;
    }
  }
  return (
    <IonItemSliding
      onIonDrag={async (e) => {
        dragRef.current = e;
        setWillUpvote((await e.target.getSlidingRatio()) <= -1);
      }}
      onTouchEnd={async () => {
        if (!dragRef.current) return;
        const ratio = await dragRef.current.target.getSlidingRatio();

        if (ratio <= -1) dragRef.current.target.closeOpened();
      }}
    >
      <IonItemOptions side="start">
        <IonItemOption color="success">
          <UpvoteArrow icon={arrowUpSharp} willUpvote={willUpvote} />
        </IonItemOption>
      </IonItemOptions>

      <CustomIonItem
        detail={false}
        routerLink={`/${actor}/c/${post.community.name}/comments/${post.post.id}`}
      >
        <Container>
          <div>{post.post.name}</div>

          {renderPostBody()}

          <Details>
            <LeftDetails>
              {communityMode ? (
                <CommunityDetails>
                  <CommunityName>by {post.creator.name}</CommunityName>
                </CommunityDetails>
              ) : (
                <IonRouterLink
                  routerLink={`/${actor}/c/${post.community.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CommunityDetails>
                    {post.community.icon && <Icon src={post.community.icon} />}
                    <CommunityName>{post.community.name}</CommunityName>
                  </CommunityDetails>
                </IonRouterLink>
              )}
              <PreviewStats stats={post.counts} />
            </LeftDetails>
            <RightDetails>
              <IonIcon icon={arrowUpSharp} />
              <IonIcon icon={arrowDownSharp} />
              <IonIcon icon={ellipsisHorizontal} />
            </RightDetails>
          </Details>
        </Container>
      </CustomIonItem>

      <IonItemOptions side="end">
        <IonItemOption>Favorite</IonItemOption>
        <IonItemOption color="danger">Delete</IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
}