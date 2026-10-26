"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {MouseEvent,FormEvent,PointerEvent} from "react";
import {getSupabase} from "../lib/supabase";
import {Art,Avatar,furnitureNames,type Furniture,type FurnitureKind} from "./room-art";
type Wall="pink"|"blue"|"green"|"cream";
type Chat={id:number;user_id:string;body:string};
type Member={user_id:string;nickname:string};
const starter:Furniture[]=[{id:"bed",kind:"bed",x:27,y:63},{id:"plant",kind:"plant",x:77,y:56},{id:"table",kind:"table",x:60,y:73},{id:"lamp",kind:"lamp",x:32,y:48}];
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
 const [tab,setTab]=useState<"furniture"|"wall"|"props">("furniture");
 const [customTab,setCustomTab]=useState<"look"|"accessory"|"speech"|"mood">("look");
 const [section,setSection]=useState<"room"|"decorate"|"shop"|"settings">("room");
 const seq=useRef(0);
 const roomRef=useRef<HTMLDivElement>(null);
 const dragging=useRef<{id:string;pointerId:number;startX:number;startY:number;moved:boolean}|null>(null);
 const furnitureRef=useRef(furniture);
 furnitureRef.current=furniture;
 const canDecorate=!supabase||!roomId||members.length===0||members[0]?.user_id===uid;
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
 function coordinates(clientX:number,clientY:number){
   const rect=roomRef.current?.getBoundingClientRect();
   if(!rect)return null;
   return {x:Math.round(Math.max(10,Math.min(90,(clientX-rect.left)/rect.width*100))),y:Math.round(Math.max(15,Math.min(85,(clientY-rect.top)/rect.height*100)))};
 }
 function startDrag(e:PointerEvent<HTMLButtonElement>,id:string){
   if(!canDecorate)return;
   e.preventDefault();e.stopPropagation();
   dragging.current={id,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false};
   e.currentTarget.setPointerCapture(e.pointerId);
   setSelected(id);
 }
 function moveDrag(e:PointerEvent<HTMLButtonElement>){
   const drag=dragging.current;
   if(!drag||drag.pointerId!==e.pointerId)return;
   if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)drag.moved=true;
   if(!drag.moved)return;
   const p=coordinates(e.clientX,e.clientY);if(!p)return;
   setFurniture(current=>current.map(item=>item.id===drag.id?{...item,...p}:item));
 }
 function finishDrag(e:PointerEvent<HTMLButtonElement>){
   const drag=dragging.current;
   if(!drag||drag.pointerId!==e.pointerId)return;
   const p=coordinates(e.clientX,e.clientY);
   if(drag.moved&&p){
     const next=furnitureRef.current.map(item=>item.id===drag.id?{...item,...p}:item);
     setFurniture(next);void persist(wall,next);
   }
   dragging.current=null;
 }
 async function send(e:FormEvent<HTMLFormElement>){
   e.preventDefault();const body=draft.trim().slice(0,500);if(!body)return;setDraft("");
   if(!supabase||!roomId){setMessages(a=>[...a,{id:Date.now(),user_id:uid||"me",body}]);return}
   const {error:err}=await supabase.from("messages").insert({room_id:roomId,user_id:uid,body});
   if(err){setError(err.message);setDraft(body)}else await refresh(roomId);
 }
 const link=typeof window!=="undefined"&&roomId?window.location.origin+"?room="+roomId:"";
 const copy=async()=>{if(link)await navigator.clipboard.writeText(link);else if(!supabase)alert("실제 초대 링크는 Supabase 연결 후 만들 수 있어요.")};
 return <main className="chii-app">
 <div className="chii-layout">
 <nav className="left-rail" aria-label="메뉴"><div className="logo">CHII ROOM</div><p className="rail-caption">작고 소중한<br/>우리만의 공간</p>
 {([["room","⌂","내 방"],["decorate","♧","꾸미기"],["shop","♧","상점"],["settings","⚙","설정"]] as const).map(([id,ico,label])=><button key={id} className={"nav-choice "+(section===id?"active":"")} onClick={()=>setSection(id)}><span>{ico}</span>{label}</button>)}
 <button className="invite-link" onClick={copy} disabled={!roomId}>♡ 초대 링크</button></nav>
 <section className="center-column">
 {error&&<div className="alert" role="alert">{error} <button onClick={()=>setError("")}>닫기</button></div>}
 {!supabase&&<div className="demo-note">디자인 미리보기 · 친구와 함께 쓰려면 Supabase 연결이 필요해요.</div>}
 {supabase&&!roomId&&<div className="setup"><input className="nickname" maxLength={20} value={nickname} onChange={e=>setNickname(e.target.value)} aria-label="닉네임" placeholder="닉네임"/><button className="pill" disabled={!ready||busy||!uid} onClick={()=>void createRoom()}>우리 방 만들기</button></div>}
 <div className={"room "+wall} ref={roomRef} onClick={place} aria-label="가구를 드래그해서 옮길 수 있는 방">
 <svg className="room-architecture" viewBox="0 0 850 690" preserveAspectRatio="none" aria-hidden="true"><g stroke="#242220" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
 <path className="wall-left" d="M25 235 430 16 430 245 25 487Z"/><path className="wall-right" d="M430 16 823 227 823 485 430 245Z"/>
 <path className="room-floor" d="M25 487 430 245 823 485 430 676Z"/>
 <path fill="none" d="M25 235 430 16 823 227M25 235V487L430 676 823 485V227M430 16V245"/>
 <path fill="#d9eef8" d="m548 146 124 67v119l-124-61Z"/><path fill="#fff" strokeWidth="2.4" d="m548 146 124 67v119l-124-61Z"/><path fill="#d7edf8" strokeWidth="2.4" d="m559 160 103 56v99l-103-51Z"/><path fill="#b4d4b3" strokeWidth="1.8" d="M559 251q29-34 47-12 22-43 56-7v83l-103-51Z"/><path fill="none" strokeWidth="2.6" d="m548 146 124 67v119l-124-61ZM559 160l103 56v99l-103-51Z"/>
 <path fill="#fffdf7" d="M716 396v-75q1-49 43-47 39 4 39 50v117Z"/><circle cx="748" cy="367" r="3" fill="#242220" stroke="none"/>
 <path fill="#fffdf7" d="m139 294 72-40v83l-72 40Z"/><path fill="none" d="m139 294 72-40v83l-72 40ZM148 285l53-29"/>
 </g><g fill="#242220"><circle cx="171" cy="327" r="3"/><circle cx="182" cy="327" r="3"/></g><path d="M172 339q6 7 12 0" stroke="#242220" strokeWidth="2" fill="none"/></svg>
 <div className="floor-decoration">✿</div>
 {furniture.map(i=><button key={i.id} aria-label={furnitureNames[i.kind]+" 드래그해서 이동"} className={"object "+(selected===i.id?"selected":"")} style={{left:i.x+"%",top:i.y+"%",zIndex:Math.round(i.y)+5}} onPointerDown={e=>startDrag(e,i.id)} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={()=>{dragging.current=null}} onClick={e=>e.stopPropagation()}><Art kind={i.kind}/></button>)}
 <Avatar style={{left:"48%",bottom:"25%"}}/><div className="music-note">♫</div>
 <Avatar friend style={{left:"67%",bottom:"21%",opacity:members.length===1 ? 0.5 : 1}}/>
 </div>
 <div className="theme-panel ink-panel"><h2>⌂ <span>방 테마</span></h2><div className="theme-options">
 {([["pink","기본","#fffaf0"],["blue","하늘","#d7eff9"],["green","풀","#e5efd6"],["cream","밤","#d5d5e8"]] as const).map(([w,label,color])=><button key={w} className={"theme-card "+(wall===w?"active":"")} onClick={()=>wallpaper(w)}><div className="theme-preview" style={{background:color}}><span className="mini-wall"/><span className="mini-bed">▰</span><span className="mini-table">●</span></div><span>{label}</span></button>)}</div></div>
 </section>
 <aside className="right-column">
 <section className="ink-panel catalog"><div className="tabbar">{([["furniture","🛋","가구"],["wall","▧","벽지"],["props","♧","소품"]] as const).map(([id,ico,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span>{ico}</span>{label}</button>)}</div>
 {tab==="furniture"||tab==="props"?<div className="catalog-grid">{(tab==="props"?kinds.filter(k=>["plant","lamp","bear"].includes(k)):kinds).map(kind=><button key={kind} className="catalog-item" onClick={()=>add(kind)}><Art kind={kind}/></button>)}</div>:<div className="catalog-grid">{(["pink","blue","green","cream"] as const).map((w,i)=><button key={w} className="catalog-item wallpaper-item" onClick={()=>wallpaper(w)} style={{background:["#fff5ef","#d7eff9","#e5efd6","#d5d5e8"][i]}}>{["기본","하늘","풀","밤"][i]}</button>)}</div>}
 <div className="catalog-hint">소품을 추가하고 방 안에서 드래그해 이동해요. <button onClick={remove} disabled={!selected}>선택 삭제</button></div></section>
 <section className="ink-panel customize"><h2>♧ 캐릭터 꾸미기</h2><div className="custom-tabs">{([["look","외형"],["accessory","액세서리"],["speech","말풍선"],["mood","감정표현"]] as const).map(([id,label])=><button key={id} className={customTab===id?"active":""} onClick={()=>setCustomTab(id)}>{label}</button>)}</div><div className="character-row"><div><Avatar/><span>치이카와</span></div><div><Avatar friend/><span>하치와레</span></div><div className="coming-soon">{customTab==="look"?"캐릭터 선택":customTab==="accessory"?"액세서리 준비 중":customTab==="speech"?"말풍선 준비 중":"표정 준비 중"}</div></div></section>
 <section className="ink-panel chat-panel"><h2>▤ 채팅 <small>{roomId?members.length+"/2":"미리보기"}</small></h2><div className="chat-log" aria-live="polite">{messages.length===0?<><div className="bubble-line"><span className="bubble-face">◕</span><span className="bubble">뭐 해?</span></div><div className="bubble-line mine"><span className="bubble">놀자...!</span><span className="bubble-face blue">◕</span></div><div className="bubble-line"><span className="bubble-face">◕</span><span className="bubble">같이 놀자!</span></div></>:messages.map(m=><div key={m.id} className={"bubble-line "+(m.user_id===uid?"mine":"")}><span className="bubble">{m.body}</span></div>)}</div><form className="chat-form" onSubmit={send}><input value={draft} maxLength={500} onChange={e=>setDraft(e.target.value)} placeholder="메시지를 입력하세요..." aria-label="메시지"/><button disabled={!!supabase&&!roomId} aria-label="전송">➤</button></form></section>
 </aside></div></main>;
}
