import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreateComment,
  useGetComments,
  useGetPostById,
} from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  comment: z.string().max(2200),
});

const PostDetail = () => {
  const { id } = useParams();
  const { mutateAsync: createComment } = useCreateComment();
  const { data: post, isPending } = useGetPostById(id || "");
  const { data: comments, isPending: isUserCommentsLoading } = useGetComments();

  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.comment) {
      return toast({
        title: "Please, enter your comment!",
      });
    }

    form.reset();

    const newComment = await createComment({
      comment: values.comment,
      userId: user.id,
      postId: post?.$id,
    });

    if (!newComment) return toast({ title: "Please, try again!" });

    navigate(`/posts/${post?.$id}`);
  }

  const handleDeletePost = () => {};

  return (
    <div className="post_details-container">
      {isPending ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img src={post?.imageUrl} alt="post" className="post_details-img" />
          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    post?.creator?.imageUrl ||
                    "assets/icon/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="rounded-full w-8 h-8 lg:w-12 lg:h-12 object-cover"
                />

                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    -
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}
                >
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleDeletePost}
                  className={`ghost_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3">
                    #{tag}
                  </li>
                ))}
              </ul>

              <hr className="border w-full border-dark-4/80 mt-[30px]" />

              <div className="flex flex-col flex-2 gap-[20px] h-[300px] pt-[15px] overflow-scroll custom-scrollbar">
                {isUserCommentsLoading ||
                !comments ||
                comments.documents.length === 0 ? (
                  <Loader />
                ) : (
                  comments?.documents.map((item) => {
                    if (item.posts.$id === post?.$id) {
                      return (
                        <div
                          className="flex gap-2 items-center"
                          key={`comment-${item.$id}`}
                        >
                          <img
                            src={
                              item.users.imageUrl ||
                              "/assets/icons/profile-placeholder.svg"
                            }
                            alt="profile"
                            className="rounded-full w-8 h-8 lg:w-9 lg:h-9 object-cover"
                          />
                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-[10px] items-center">
                              <p className="small-semibold text-light-3">
                                {item.users.name}
                              </p>
                              <p className="small-medium">{item.comment}</p>
                            </div>
                            <p className="tiny-medium text-light-3">
                              {multiFormatDateString(item?.$createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>

            <div className="flex-center w-full gap-[11px] ">
              <img
                src={user.imageUrl || "assets/icon/profile-placeholder.svg"}
                alt="creator"
                className="rounded-full w-8 h-6 lg:w-12 lg:h-10 object-cover"
              />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Button
                              type="submit"
                              className="absolute right-0 inset-y-0 m-auto cursor-pointer"
                            >
                              <img src="/assets/icons/send.svg" alt="send" />
                            </Button>
                            <Input
                              type="text"
                              placeholder="Write your comment..."
                              className="shad-input !bg-dark-3"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
