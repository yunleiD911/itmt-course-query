(() => {
  const data = window.COURSE_DATA;
  const form = document.getElementById('query-form');
  const input = document.getElementById('account');
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const list = document.getElementById('course-list');
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function normalize(value) {return value.trim().replace(/@glodon\.com$/i, '').toUpperCase();}
  function roomText(c) {return c.room ? c.room : '待定（以课程通知为准）';}
  const schedule = document.getElementById('full-schedule');
  const sorted = Object.values(data.courses).sort((a,b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code));
  for (const month of [...new Set(sorted.map(c => c.date.slice(0,7)))]) {
    const section = node('section', undefined, 'month-block');
    const items = sorted.filter(c => c.date.startsWith(month));
    const heading = node('div', undefined, 'month-heading');
    heading.append(node('h3', Number(month.slice(5)) + '月'), node('span', items.length + ' 门课程 · ' + (month.endsWith('11') ? 'NOVEMBER' : 'DECEMBER')));
    section.append(heading);
    for (const c of items) {
      const row = node('article', undefined, 'schedule-course');
      const date = node('div', undefined, 'calendar-date');
      date.append(node('strong', c.date.slice(-2)), node('span', c.weekday + ' · ' + c.time));
      const body = node('div', undefined, 'calendar-body');
      const tags = node('div', undefined, 'calendar-tags');
      tags.append(node('span', c.code, 'course-code'), node('span', c.code.startsWith('AI') ? 'AI工程实践' : '架构设计实战', 'track-label'));
      if (sorted.filter(other => other.date === c.date).length > 1) tags.append(node('span', '同期课程', 'parallel-tag'));
      body.append(tags, node('h3', c.title), node('div', '会议室：' + roomText(c), 'course-loc'));
      const teacher = node('div', undefined, 'calendar-teacher');
      teacher.append(node('span', c.teacher.slice(0,1), 'avatar'),node('span', c.teacher + ' · 讲师'));
      row.append(date, body, teacher); section.append(row);
    }
    schedule.append(section);
  }
  function showPerson(account) {
    const person = data.people[account];
    document.getElementById('result-title').textContent = person.name + '，这是你的课表';
    document.getElementById('result-subtitle').textContent = account + ' · 已报名 ' + person.courses.length + ' 门课程';
    const courses = person.courses.map(code => data.courses[code]).sort((a,b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code));
    status.textContent = courses.length ? '查询成功，以下为你最终确认的报名课程。' : '已找到你的记录，目前尚未选定课程。请联系培训负责人补选。';
    for (const c of courses) {
      const card = node('article', undefined, 'course');
      const date = node('div', undefined, 'date-box');
      date.append(node('strong', c.date.slice(5).replace('-', '/')),node('span', c.weekday + ' · ' + c.time),node('span', '2026年'));
      const detail = node('div');
      detail.append(node('span', c.code, 'course-code'),node('h3', c.title),node('div', '授课讲师：' + c.teacher, 'course-meta'),node('div', '会议室：' + roomText(c), 'course-meta course-room'));
      card.append(date, detail); list.append(card);
    }
    results.hidden = false;
    document.getElementById('print').hidden = !courses.length;
  }
  function offerChoices(keys, lead) {
    status.textContent = lead;
    for (const key of keys.slice(0, 30)) {
      const choice = node('button', data.people[key].name + ' · ' + key, 'secondary');
      choice.type = 'button';
      choice.style.margin = '12px 12px 0 0';
      choice.addEventListener('click', () => {input.value = key; form.requestSubmit();});
      status.append(choice);
    }
    if (keys.length > 30) status.append(node('span', '（共 ' + keys.length + ' 人，仅显示前 30 位，请输入更完整的姓名）', ''));
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    results.hidden = true;
    list.replaceChildren();
    status.className = '';
    const raw = input.value.trim();
    const account = normalize(raw);
    if (!raw) {
      status.textContent = '请先输入域账号或姓名。'; status.className = 'error'; input.focus(); return;
    }
    // 1) 域账号精确命中
    if (Object.hasOwn(data.people, account)) {showPerson(account); return;}
    // 2) 姓名精确命中
    const exactNames = Object.keys(data.people).filter(key => data.people[key].name === raw);
    if (exactNames.length === 1) {showPerson(exactNames[0]); return;}
    if (exactNames.length > 1) {offerChoices(exactNames, '找到多位同名学员，请选择你本人：'); return;}
    // 3) 域账号前缀 / 姓名包含，合并去重
    const hits = new Set(Object.keys(data.people).filter(key => key.startsWith(account + '-') || key === account));
    for (const key of Object.keys(data.people)) if (data.people[key].name.includes(raw)) hits.add(key);
    const keys = [...hits].sort();
    if (keys.length === 1) {showPerson(keys[0]); return;}
    if (keys.length > 1) {offerChoices(keys, '找到以下学员，请选择你本人：'); return;}
    status.textContent = '未查询到该域账号或姓名的报名记录。请检查拼写；如已报名，请联系培训负责人核实。';
    status.className = 'error';
  });
  input.addEventListener('input', () => {results.hidden = true; status.className = ''; status.textContent = '输入完成后，点击“查询课程”。';});
  document.getElementById('print').addEventListener('click', () => window.print());
})();
