import { getCookies, HandlerContext, supabase } from "../../server_deps.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const accessToken = getCookies(req.headers)["deploy_chat_token"];
  if (!accessToken) {
    return new Response("Not signed in", { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("access_token", accessToken);
  if (error) {
    return new Response(error.message, { status: 400 });
  }

  const id = data[0].id;
  const message = await req.text();
  const channel = new BroadcastChannel("test");
  channel.postMessage(message);
  channel.close();

  await supabase
    .from("messages")
    .insert([{
      message,
      room: 0, // "test" room
      from: id,
    }], { returning: "minimal" });

  return new Response("ok");
};