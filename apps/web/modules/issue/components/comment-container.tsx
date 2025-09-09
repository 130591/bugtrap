import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import { X } from "lucide-react"
import { Edit } from "lucide-react"
import { Copy } from "lucide-react"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"


export default function CommentContainer({ data }: { data: any[] }) {
  return (
     <div id="comments-section" className="space-y-4">
      {data.length > 0 ? (
        data.map((comment) => (
          <>
              <div className="flex gap-3">
                             <Avatar className="w-6 h-6 mt-1">
                               <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                             </Avatar>
                             <div className="flex-1">
                               <RichMDXEditor
                                 value={newComment}
                                 onChange={setNewComment}
                                 placeholder="Leave a comment..."
                                 variant="comment"
                                 maxHeight={200}
                               />
                               <div className="flex items-center justify-end gap-2 mt-2">
                                 <Button variant="ghost" size="sm">
                                   Cancel
                                 </Button>
                                 <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                                   Comment
                                 </Button>
                               </div>
                             </div>
                           </div>

                           <div key={comment.id} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex gap-3">
              <Avatar className="w-7 h-7">
                <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs bg-pink-600">
                  {comment.user.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-100">{comment.user}</span>
                  <span className="text-gray-500 text-sm">commented {comment.timestamp}</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-gray-200 leading-relaxed">{comment.action}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    👍 0
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    👎 0
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    😄 0
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    🎉 0
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    ❤️ 0
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    🚀 0
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-300 h-7 px-2"
                  >
                    👀 0
                  </Button>
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-gray-500 hover:text-gray-300"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem className="text-gray-300">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem className="text-red-400">
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
          
        ))
      ) : (
        <div className="text-center py-8 bg-gray-900/30 rounded-lg border border-gray-800/50">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No comments yet</p>
          <p className="text-gray-500 text-xs mt-1">Be the first to share your thoughts</p>
        </div>
      )}
    </div>
  )
}