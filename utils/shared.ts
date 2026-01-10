/* eslint-disable @typescript-eslint/no-explicit-any */
export const truncate=(str:string='',length=150)=>{
  return `${str?.slice(0,length)}${str.length>length?'...':''}`
}

export const copyClipboard=(text:any='')=>{
  navigator.clipboard.writeText(text);
}

export function getRandomCode(length = 5) {
  const letters = '0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}