const id=new URLSearchParams(location.search).get('id');
location.replace(`sistema.html${id?`#/character/${encodeURIComponent(id)}`:'#/character/new'}`);
