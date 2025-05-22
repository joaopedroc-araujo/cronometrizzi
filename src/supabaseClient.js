// import { createClient } from "@supabase/supabase-js";

// let supabaseInstance = null;

// export const getSupabaseClient = (trelloToken, cardId) => {
//   if (!supabaseInstance) {
//     supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
//       global: {
//         headers: {
//           "X-Trello-Token": trelloToken,
//           "X-Trello-Card-ID": cardId,
//         },
//       },
//       auth: {
//         persistSession: false,
//       },
//       db: {
//         schema: 'public'
//       }
//     });
//   }
//   return supabaseInstance;
// };
