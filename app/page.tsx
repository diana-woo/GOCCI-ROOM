"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {MouseEvent,FormEvent} from "react";
import {getSupabase} from "../lib/supabase";
import {Art,Avatar,furnitureNames,type Furniture,type FurnitureKind} from "./room-art";
type Wall="pink"|"blue"|"green"|"cream";
type Chat={id:number;user_id:string;body:string};
type Member={user_id:string;nickname:string};
const starter:Furniture[]=[{id:"bed",kind:"bed",x:28,y:50},{id:"plant",kind:"plant",x:73,y:45}];
const kinds=Object.keys(furnitureNames) as FurnitureKind[];
export default function Home(){
 const supabase=getSupabase();
 const [uid,setUid]=useState("");
 const [roomId,setRoomId]=useState("");
 const [nickname,setNickname]=useState("나");
 const [wall,setWall]=useState<Wall>("pink");
 const [furniture,setFurniture]=useState<Furniture[]>(starter);
 const [selected,setSelected]=useState<string|null>(null);
 const [members,setMembers]=useState<Member[]>([]);
 const [messages,setMessages]=useState<Chat[]>([]);
 const [draft,setDraft]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const seq=useRef(0);
 const demo=!supabase;
 const refresh=useCallback(async(rid:string)=>{
   if(!supabase)return;
   const [room,people,chat]=await Promise.all([
     supabase.from("rooms").select("wallpaper,furniture").eq("id",rid).single(),
     supabase.from("room_members").select("user_id,nickname").eq("room_id",rid),
     supabase.from("messages").select("id,user_id,body").eq("room_id",rid).order("id",{ascending:false}).limit(100)
   ]);
   if(room.data){setWall(room.data.wallpaper as Wall);setFurniture(room.data.furniture as Furniture[])}
   if(people.data)setMembers(people.data);
   if(chat.data)setMessages([...chat.data].reverse());
 },[supabase]);
 useEffect(()=>{
   if(!supabase){setReady(true);return}
   let live=true;
   supabase.auth.getSession().then(async({data,error:sessionError})=>{
     if(!live)return;
     if(sessionError){setError(sessionError.message);setReady(true);return}
     let user=sessionError?null:data.session?.user;
     if(!user){const result=await supabase.auth.signInAnonymously();if(result.error){setError("익명 로그인을 활성화해 주세요: "+result.error.message);setReady(true);return}user=result.data.user}
     if(!live||!user)return;
     setUid(user.id);setReady(true);
   });
   return()=>{live=false};
 },[supabase]);
 useEffect(()=>{
   if(!supabase||!uid||!roomId)return;
   void refresh(roomId);
   const channel=supabase.channel("gocci-"+roomId)
     .on("postgres_changes",{event:"*",schema:"public",table:"rooms",filter:"id=eq."+roomId},()=>{void refresh(roomId)})
     .on("postgres_changes",{event:"*",schema:"public",table:"room_members",filter:"room_id=eq."+roomId},()=>{void refresh(roomId)})
     .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"room_id=eq."+roomId},()=>{void refresh(roomId)})
     .subscribe();
   return()=>{void supabase.removeChannel(channel)};
 },[supabase,uid,roomId,refresh]);
 useEffect(()=>{
   if(!supabase||!uid)return;
   const id=new URLSearchParams(window.location.search).get("room");
   if(id && /^[0-9a-f-]{36}$/i.test(id)){void join(id)}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[uid]);
 async function join(id:string){
   if(!supabase||!uid)return;
   setBusy(true);setError("");
   const {error:err}=await supabase.rpc("join_room",{p_room:id,p_nickname:nickname.trim()||"친구"});
   if(err)setError(err.message);else{setRoomId(id);window.history.replaceState(null,"","?room="+id)}
   setBusy(false);
 }
 async function createRoom(){
   if(!supabase||!uid)return;
   setBusy(true);setError("");
   const {data,error:err}=await supabase.rpc("create_room",{p_nickname:nickname.trim()||"나"});
   if(err)setError(err.message);else if(data){setRoomId(data as string);window.history.replaceState(null,"","?room="+data)}
   setBusy(false);
 }
 async function persist(nextWall:Wall,nextFurniture:Furniture[]){
   if(!supabase||!roomId)return;
   if(members.length && members[0]?.user_id!==uid){setError("방 꾸미기는 방장만 변경할 수 있어요.");return}
   const {error:err}=await supabase.from("rooms").update({wallpaper:nextWall,furniture:nextFurniture}).eq("id",roomId);
   if(err){setError(err.message);await refresh(roomId)}
 }
 function wallpaper(w:Wall){setWall(w);void persist(w,furniture)}
 function add(kind:FurnitureKind){const next=[...furniture,{id:"f-"+Date.now()+"-"+(++seq.current),kind,x:50,y:58}];setFurniture(next);void persist(wall,next)}
 function remove(){const next=furniture.filter(i=>i.id!==selected);setFurniture(next);setSelected(null);void persist(wall,next)}
 function place(e:MouseEvent<HTMLDivElement>){
   if(!selected)return;
   const r=e.currentTarget.getBoundingClientRect();
   const x=Math.max(10,Math.min(90,(e.clientX-r.left)/r.width*100));
   const y=Math.max(15,Math.min(85,(e.clientY-r.top)/r.height*100));
   const next=furniture.map(i=>i.id===selected?{...i,x,y}:i);
   setFurniture(next);setSelected(null);void persist(wall,next);
 }
 async function send(e:FormEvent<HTMLFormElement>){
   e.preventDefault();const body=draft.trim().slice(0,500);if(!body)return;setDraft("");
   if(!supabase||!roomId){setMessages(a=>[...a,{id:Date.now(),user_id:uid||"me",body}]);return}
   const {error:err}=await supabase.from("messages").insert({room_id:roomId,user_id:uid,body});
   if(err){setError(err.message);setDraft(body)}else await refresh(roomId);
 }
 const link=typeof window!=="undefined"&&roomId?window.location.origin+"?room="+roomId:"";
 const copy=async()=>{if(link)await navigator.clipboard.writeText(link);else if(!supabase)alert("실제 초대 링크는 Supabase 연결 후 만들 수 있어요.")};
 return <main className="shell"><header className="header"><div><div className="eyebrow">TINY PLACE, BIG FEELINGS</div><div className="brand">GOCCI ROOM ♡</div></div><button className="pill" onClick={copy} disabled={!roomId}>초대 링크 복사 ↗</button></header><p className="subtitle">우리 둘만의 작고 말랑한 공간. 가구를 고르고 방 안을 눌러 옮겨보세요.</p>
 {error&&<div className="alert" role="alert">{error} <button onClick={()=>setError("")}>닫기</button></div>}
 {demo?<div className="alert">미리보기 모드 · Supabase 환경변수를 연결하면 실제 2인 방과 실시간 채팅을 사용할 수 있어요.</div>:!roomId&&<div className="setup"><input className="nickname" maxLength={20} value={nickname} onChange={e=>setNickname(e.target.value)} aria-label="닉네임" placeholder="닉네임"/><button className="pill" disabled={!ready||busy||!uid} onClick={()=>void createRoom()}>새 방 만들기</button><span className="status">{!ready?"연결 중…":"방을 만들면 친구에게 링크를 보낼 수 있어요."}</span></div>}
 {roomId&&<p className="status">함께 있는 사람 {members.length}/2 · {members.map(m=>m.nickname).join(" · ")} · 방장만 꾸미기를 변경할 수 있어요.</p>}
 <div className="columns"><section className="panel"><h2>⌂ 우리의 작은 방</h2><div className={"room "+wall} onClick={place} aria-label="방 꾸미기 공간"><div className="floor"/><div className="window">☁</div>{furniture.map(i=><button key={i.id} aria-label={furnitureNames[i.kind]+" 위치 선택"} className={"object "+(selected===i.id?"selected":"")} style={{left:i.x+"%",top:i.y+"%"}} onClick={e=>{e.stopPropagation();setSelected(i.id)}}><Art kind={i.kind}/></button>)}<Avatar/><div className="name-tag" style={{left:"30%",top:"65%"}}>나</div><Avatar friend/><div className="name-tag" style={{left:"64%",top:"57%"}}>친구</div></div><div className="palette"><b>벽지</b>{([["pink","#fbe6e8"],["blue","#e1edf9"],["green","#e6efdf"],["cream","#fff1d5"]] as const).map(([w,c])=><button key={w} aria-label={w+" 벽지"} aria-pressed={wall===w} style={{background:c,outline:wall===w?"2px solid #e995ab":undefined}} onClick={()=>wallpaper(w)}/>)}<button className="tool" onClick={remove} disabled={!selected}>선택 가구 삭제</button></div></section>
 <aside className="stack"><section className="panel"><h2>✎ 가구 꾸미기</h2><div className="furniture-grid">{kinds.map(kind=><button key={kind} className="furn-btn" onClick={()=>add(kind)}><Art kind={kind}/><span>{furnitureNames[kind]}</span></button>)}</div></section><section className="panel"><h2>♡ 채팅 {demo&&<small>(미리보기)</small>}</h2><div className="chat-log" aria-live="polite">{messages.length===0&&<p className="status">첫 인사를 건네보세요 ♡</p>}{messages.map(m=><p key={m.id} className={"chat-line "+(m.user_id!==uid?"friend":"")}>{m.user_id===uid?"나":members.find(p=>p.user_id===m.user_id)?.nickname||"친구"}: {m.body}</p>)}</div><form className="chat-form" onSubmit={send}><input value={draft} maxLength={500} onChange={e=>setDraft(e.target.value)} placeholder="메시지를 입력하세요" aria-label="메시지"/><button disabled={!!supabase&&!roomId}>보내기</button></form></section></aside></div><p className="footer">GOCCI ROOM · 둘만의 작은 세계</p></main>;
}
