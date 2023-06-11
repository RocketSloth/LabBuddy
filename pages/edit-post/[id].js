// pages/edit-post/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import "easymde/dist/easymde.min.css"
import { supabase } from '../../api'

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

function EditPost() {
  const [post, setPost] = useState(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    fetchPost()
    async function fetchPost() {
      if (!id) return
      const { data } = await supabase
        .from('labs')
        .select()
        .filter('id', 'eq', id)
        .single()
      setPost(data)
    }
  }, [id])
  if (!post) return null
  function onChange(e) {
    setPost(prevPost => ({ ...prevPost, [e.target.name]: e.target.value }))
  }
  const { test_type, test_result, test_date } = post
  async function updateCurrentPost() {
    if (!test_type || !test_result || !test_date) return
    const user = supabase.auth.user()
    await supabase
      .from('labs')
      .update([
          { test_type, test_result, test_date }
       ])
      .match({ id })
    router.push('/my-posts')
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">Edit post</h1>
      <input
        onChange={onChange}
        name="test_type"
        placeholder="Test Type"
        value={post.test_type}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      /> 
      <SimpleMDE value={post.test_result} onChange={value => setPost(prevPost => ({ ...prevPost, test_result: value }))} />
      <input
        onChange={onChange}
        name="test_date"
        type="date"
        value={post.test_date}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
      <button
        className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
        onClick={updateCurrentPost}>Update Post</button>
    </div>
  )
}

export default EditPost
