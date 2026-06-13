import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://szpmloreyroeiagmjbso.supabase.co'
const supabaseKey = 'sb_publishable_XxdIpzG7bqRjCSTLG9bTcA_Ccfp9sE1'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdmin() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error("Error:", error.message)
  } else {
    console.log("Success! Users count:", data.users.length)
  }
}

testAdmin()
