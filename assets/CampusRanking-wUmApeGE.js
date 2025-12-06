import{g as X,d as V,k as P,s as A,e as f,_ as v,f as L,r as k,h as J,i as Q,u as Y,j as a,l as Z,m as rr,n as er,o as tr,a as $,C as ar,b as or,B as y,T as G,F as W,I as H,S as B,M as E,c as nr}from"./index-wtPQKena.js";import{d as ir,a as sr,S as lr}from"./tiaData-_fKIsFYC.js";function cr(r){return X("MuiLinearProgress",r)}V("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const ur=["className","color","value","valueBuffer","variant"];let C=r=>r,U,D,F,z,w,q;const O=4,dr=P(U||(U=C`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`)),fr=P(D||(D=C`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`)),mr=P(F||(F=C`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`)),br=r=>{const{classes:e,variant:t,color:i}=r,x={root:["root",`color${f(i)}`,t],dashed:["dashed",`dashedColor${f(i)}`],bar1:["bar",`barColor${f(i)}`,(t==="indeterminate"||t==="query")&&"bar1Indeterminate",t==="determinate"&&"bar1Determinate",t==="buffer"&&"bar1Buffer"],bar2:["bar",t!=="buffer"&&`barColor${f(i)}`,t==="buffer"&&`color${f(i)}`,(t==="indeterminate"||t==="query")&&"bar2Indeterminate",t==="buffer"&&"bar2Buffer"]};return rr(x,cr,e)},N=(r,e)=>e==="inherit"?"currentColor":r.vars?r.vars.palette.LinearProgress[`${e}Bg`]:r.palette.mode==="light"?er(r.palette[e].main,.62):tr(r.palette[e].main,.5),gr=A("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.root,e[`color${f(t.color)}`],e[t.variant]]}})(({ownerState:r,theme:e})=>v({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},backgroundColor:N(e,r.color)},r.color==="inherit"&&r.variant!=="buffer"&&{backgroundColor:"none","&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}},r.variant==="buffer"&&{backgroundColor:"transparent"},r.variant==="query"&&{transform:"rotate(180deg)"})),hr=A("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.dashed,e[`dashedColor${f(t.color)}`]]}})(({ownerState:r,theme:e})=>{const t=N(e,r.color);return v({position:"absolute",marginTop:0,height:"100%",width:"100%"},r.color==="inherit"&&{opacity:.3},{backgroundImage:`radial-gradient(${t} 0%, ${t} 16%, transparent 42%)`,backgroundSize:"10px 10px",backgroundPosition:"0 -23px"})},L(z||(z=C`
    animation: ${0} 3s infinite linear;
  `),mr)),xr=A("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.bar,e[`barColor${f(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&e.bar1Indeterminate,t.variant==="determinate"&&e.bar1Determinate,t.variant==="buffer"&&e.bar1Buffer]}})(({ownerState:r,theme:e})=>v({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",backgroundColor:r.color==="inherit"?"currentColor":(e.vars||e).palette[r.color].main},r.variant==="determinate"&&{transition:`transform .${O}s linear`},r.variant==="buffer"&&{zIndex:1,transition:`transform .${O}s linear`}),({ownerState:r})=>(r.variant==="indeterminate"||r.variant==="query")&&L(w||(w=C`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `),dr)),pr=A("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.bar,e[`barColor${f(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&e.bar2Indeterminate,t.variant==="buffer"&&e.bar2Buffer]}})(({ownerState:r,theme:e})=>v({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},r.variant!=="buffer"&&{backgroundColor:r.color==="inherit"?"currentColor":(e.vars||e).palette[r.color].main},r.color==="inherit"&&{opacity:.3},r.variant==="buffer"&&{backgroundColor:N(e,r.color),transition:`transform .${O}s linear`}),({ownerState:r})=>(r.variant==="indeterminate"||r.variant==="query")&&L(q||(q=C`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `),fr)),vr=k.forwardRef(function(e,t){const i=J({props:e,name:"MuiLinearProgress"}),{className:x,color:M="primary",value:s,valueBuffer:T,variant:l="indeterminate"}=i,m=Q(i,ur),u=v({},i,{color:M,variant:l}),b=br(u),g=Y(),d={},h={bar1:{},bar2:{}};if((l==="determinate"||l==="buffer")&&s!==void 0){d["aria-valuenow"]=Math.round(s),d["aria-valuemin"]=0,d["aria-valuemax"]=100;let c=s-100;g.direction==="rtl"&&(c=-c),h.bar1.transform=`translateX(${c}%)`}if(l==="buffer"&&T!==void 0){let c=(T||0)-100;g.direction==="rtl"&&(c=-c),h.bar2.transform=`translateX(${c}%)`}return a.jsxs(gr,v({className:Z(b.root,x),ownerState:u,role:"progressbar"},d,{ref:t},m,{children:[l==="buffer"?a.jsx(hr,{className:b.dashed,ownerState:u}):null,a.jsx(xr,{className:b.bar1,ownerState:u,style:h.bar1}),l==="determinate"?null:a.jsx(pr,{className:b.bar2,ownerState:u,style:h.bar2})]}))}),Cr=vr,I=[{key:"ALL_GROWTH_RATE",label:"All Students Growth",fmt:"pct"},{key:"ECODIS_GROWTH_RATE",label:"Econ Disadv. Growth",fmt:"pct"},{key:"HISPANIC_GROWTH_RATE",label:"Hispanic Growth",fmt:"pct"},{key:"WHITE_GROWTH_RATE",label:"White Growth",fmt:"pct"},{key:"AFR_AMER_GROWTH_RATE",label:"African American Growth",fmt:"pct"},{key:"FEMALE_GROWTH_RATE",label:"Female Growth",fmt:"pct"},{key:"MALE_GROWTH_RATE",label:"Male Growth",fmt:"pct"}],Tr={ALL_GROWTH_RATE:"ALL_STUDENT_COUNT",ECODIS_GROWTH_RATE:"ECODIS_COUNT",HISPANIC_GROWTH_RATE:"HISPANIC_COUNT",WHITE_GROWTH_RATE:"WHITE_COUNT",AFR_AMER_GROWTH_RATE:"AFR_AMER_COUNT",FEMALE_GROWTH_RATE:"FEMALE_COUNT",MALE_GROWTH_RATE:"MALE_COUNT"},R=r=>r==null||Number.isNaN(r)?"—":Intl.NumberFormat().format(r),K=r=>r==null||Number.isNaN(r)?"—":Intl.NumberFormat(void 0,{style:"percent",maximumFractionDigits:1}).format(r);function Rr(r){var j,S;const e=Y(),t=Array.isArray(r==null?void 0:r.data23)?r.data23:ir??[],i=Array.isArray(r==null?void 0:r.data24)?r.data24:sr??[],[x,M]=k.useState(2024),[s,T]=k.useState("ALL_GROWTH_RATE"),l=x===2023?t:i,m=((j=I.find(o=>o.key===s))==null?void 0:j.fmt)==="pct",u=m?K:R,b=k.useMemo(()=>{const o=Array.isArray(l)?l:[],p=Tr[s]??"ALL_STUDENT_COUNT";return o.filter(n=>n&&n[s]!=null).map(n=>({campus:n.CAMPUS,value:n[s],n:(n==null?void 0:n[p])??null})).sort((n,_)=>n.value-_.value).slice(0,12)},[l,s]),g=e.palette.text.primary,d=e.palette.mode==="dark"?$("#ffffff",.22):$("#000000",.12),h={color:"#0c0b0bff","& .MuiSvgIcon-root":{color:"#292020ff"},"& .MuiOutlinedInput-notchedOutline":{borderColor:"rgba(0,0,0,0.25)"},"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"rgba(0,0,0,0.45)"},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:"rgba(0,0,0,0.65)"}},c={PaperProps:{sx:{bgcolor:"#fff",color:"#111",maxHeight:360,"& .MuiMenuItem-root.Mui-selected":{bgcolor:"rgba(0,0,0,0.06)"},"& .MuiMenuItem-root.Mui-selected:hover":{bgcolor:"rgba(0,0,0,0.10)"}}}};return a.jsx(ar,{sx:{bgcolor:"background.paper",height:460},children:a.jsxs(or,{sx:{height:"100%"},children:[a.jsxs(lr,{direction:{xs:"column",md:"row"},spacing:2,alignItems:{md:"center"},sx:{mb:1},children:[a.jsx(y,{sx:{flex:1},children:a.jsxs(G,{variant:"subtitle1",sx:{color:"#000",fontSize:20,fontWeight:600},children:["Metric — ",(S=I.find(o=>o.key===s))==null?void 0:S.label]})}),a.jsxs(W,{size:"small",sx:{minWidth:120},children:[a.jsx(H,{sx:{color:"black"},children:"Year"}),a.jsxs(B,{label:"Year",value:x,onChange:o=>M(Number(o.target.value)),sx:h,MenuProps:c,children:[a.jsx(E,{value:2023,children:"2023"}),a.jsx(E,{value:2024,children:"2024"})]})]}),a.jsxs(W,{size:"small",sx:{minWidth:220},children:[a.jsx(H,{sx:{color:"black"},children:"Metric"}),a.jsx(B,{label:"Metric",value:s,onChange:o=>T(o.target.value),sx:h,MenuProps:c,children:I.map(o=>a.jsx(E,{value:o.key,children:o.label},o.key))})]})]}),a.jsx(y,{sx:{height:360},children:b.length?a.jsx(nr,{data:b,layout:"horizontal",keys:["value"],indexBy:"campus",margin:{top:10,right:24,bottom:56,left:200},padding:.3,colors:["#59A14F"],enableGridY:!1,enableGridX:!0,valueScale:{type:"linear",min:0,max:m?1:"auto"},axisLeft:{tickSize:0,tickPadding:6},axisBottom:{tickSize:0,tickPadding:8,tickRotation:0,tickValues:m?[0,.25,.5,.75,1]:void 0,format:o=>m?K(o):R(o),legend:m?" ":"",legendOffset:40,legendPosition:"middle"},labelSkipWidth:60,label:o=>{var _;const p=(_=o.data)==null?void 0:_.n,n=p==null?"":`  (n=${R(p)})`;return`${u(o.value)}${n}`},valueFormat:o=>u(o),theme:{textColor:g,labels:{text:{fontSize:17,fill:g}},axis:{domain:{line:{stroke:d}},ticks:{text:{fontSize:15,fill:g},line:{stroke:d}},legend:{text:{fill:g}}},grid:{line:{stroke:d,strokeDasharray:"4 4"}},tooltip:{container:{fontSize:14,background:"rgba(0,0,0,0.9)",color:"#fff",border:`1px solid ${d}`}}},tooltip:({data:o,value:p})=>a.jsx(y,{sx:{p:1},children:a.jsxs(G,{variant:"caption",children:[a.jsx("strong",{children:o.campus}),a.jsx("br",{}),u(p)," ",o.n!=null?`• n=${R(o.n)}`:""]})})}):a.jsx(y,{sx:{mt:4},children:a.jsx(Cr,{})})})]})})}export{Rr as default};
