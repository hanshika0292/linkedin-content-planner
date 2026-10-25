import type { Post } from "../types"
import { PostCard } from "./PostCard"

interface PostsGridProps {
  posts: Post[]
  onEdit: (post: Post) => void
  onDelete: (postId: string) => void
  onDuplicate: (post: Post) => void
  onPublish: (post: Post) => void
}

export function PostsGrid({ posts, onEdit, onDelete, onDuplicate, onPublish }: PostsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={() => onEdit(post)}
          onDelete={() => onDelete(post.id)}
          onDuplicate={() => onDuplicate(post)}
          onPublish={() => onPublish(post)}
        />
      ))}
    </div>
  )
}
