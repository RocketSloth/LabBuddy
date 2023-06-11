import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../../api'

export default function Post({ post }) {
  const router = useRouter()
  if (router.isFallback || !post) {
    return <div>Loading...</div>
  }
  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracking-wide">{post.test_type}</h1>
      <p className="text-sm font-light my-4">by {post.test_results}</p>
      <div className="mt-8">
        <ReactMarkdown className='prose' children={post.test_date} />
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const { data, error } = await supabase
    .from('labs')
    .select('id')
  const paths = data.map(post => ({ params: { id: post.id.toString() }}))
  return {
    paths,
    fallback: true
  }
}

export async function getStaticProps ({ params }) {
  const { id } = params
  const { data } = await supabase
    .from('labs')
    .select()
    .filter('id', 'eq', id)
    .single()
  return {
    props: {
      post: data
    }
  }
}
