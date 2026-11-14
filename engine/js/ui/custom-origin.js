export const CUSTOM_ORIGIN = 'Origem Personalizada (Homebrew)';

export function customOriginForm(data, onChange = () => {}) {
  data.nome ??= '';
  data.caracteristicas ??= [];
  const root=document.createElement('section');root.className='card';
  const title=document.createElement('h3');title.textContent=CUSTOM_ORIGIN;
  const label=document.createElement('label');label.className='field';label.textContent='Nome da origem';
  const name=document.createElement('input');name.className='input';name.value=data.nome;name.placeholder='Nome da sua origem';name.maxLength=150;
  name.oninput=()=>{data.nome=name.value;onChange();};label.append(name);
  const note=document.createElement('p');note.className='text-soft text-sm';note.textContent='Conteúdo Homebrew. As descrições não aplicam bônus automáticos.';
  const rows=document.createElement('div');rows.className='col';
  const add=document.createElement('button');add.type='button';add.className='btn btn--subtle';add.textContent='+ Adicionar característica';
  function renderRows(){rows.replaceChildren();data.caracteristicas.forEach((item,index)=>{
    const row=document.createElement('div');row.className='field';
    const fieldLabel=document.createElement('label');fieldLabel.textContent=`Característica ${index+1}`;
    const input=document.createElement('textarea');input.className='textarea';input.rows=3;input.value=item;fieldLabel.append(input);
    input.oninput=()=>{data.caracteristicas[index]=input.value;onChange();};
    const remove=document.createElement('button');remove.type='button';remove.className='btn btn--ghost btn--sm';remove.textContent='Remover característica';remove.onclick=()=>{data.caracteristicas.splice(index,1);renderRows();onChange();};
    row.append(fieldLabel,remove);rows.append(row);
  });}
  add.onclick=()=>{data.caracteristicas.push('');renderRows();onChange();};
  root.append(title,note,label,rows,add);renderRows();return root;
}
