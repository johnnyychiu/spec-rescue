const $ = (selector) => document.querySelector(selector);
const form = $('#brief-form');
const brief = $('#brief');
const launch = $('#launch-button');
const launchLabel = $('#launch-label');
const notice = $('#notice');
const examples = {
  books: "I want to build a second-hand book exchange for university students. Students should list books, find books for their courses, and arrange a campus handover. We have two days to build an MVP. I'm not sure whether we need payments, chat, or student verification yet.",
  booking: "I run a small barbershop with three barbers. I want customers to book online, choose a barber, and avoid double bookings. Staff should be able to block lunch breaks. We have one developer and a weekend. Payments and SMS reminders would be nice, but I don't know what belongs in the first version.",
  events: "Our student society needs an event signup app for a 100-person workshop next week. We need a waitlist, cancellations, and a way to check people in at the door. Some attendees may bring friends. We have two days and no budget for paid services. What should the MVP include?",
};
const agentNames = { product: 'Product', qa: 'QA', architect: 'Architecture' };
let configured = false;
let busy = false;
let currentRun = null;
let source = null;
let pollTimer = null;
let polling = false;
let requestGeneration = 0;
const runIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function setRunQuery(id) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('run', id);
  else url.searchParams.delete('run');
  window.history.replaceState(null, '', url);
}

function showNotice(message, error = false, retry = false) {
  notice.replaceChildren(document.createTextNode(message));
  notice.classList.toggle('error', error);
  notice.hidden = !message;
  if (retry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Check again';
    button.addEventListener('click', checkConfig);
    notice.append(button);
  }
}

function setBusy(value) {
  busy = value;
  brief.disabled = value;
  document.querySelectorAll('[data-example]').forEach(button => { button.disabled = value; });
  launch.disabled = busy || !configured || !brief.value.trim();
  launchLabel.textContent = busy ? 'Team is working…' : configured ? 'Rescue this brief' : 'Model configuration needed';
  form.setAttribute('aria-busy', String(value));
}

async function requestJSON(url, options) {
  const response = await fetch(url, options);
  const type = response.headers.get('content-type') || '';
  let data;
  if (type.includes('json')) data = await response.json();
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `The server returned ${response.status}. Please try again.`);
  if (!data) throw new Error('The server returned an unexpected response. Check that the Spec Rescue server is running.');
  return data;
}

async function checkConfig() {
  $('#connection-label').textContent = 'Checking configuration';
  try {
    const config = await requestJSON('/api/config');
    configured = Boolean(config.ready);
    $('#connection-dot').className = `connection-dot ${configured ? 'ready' : 'error'}`;
    $('#connection-label').textContent = configured ? 'Mozaik runtime ready' : 'Model setup needed';
    $('#connection-label').title = config.model ? `Configured model: ${config.model}` : '';
    if (!configured) {
      const missing = Array.isArray(config.missing) && config.missing.length ? ` Missing: ${config.missing.join(', ')}.` : '';
      showNotice(`The agents need a model provider before they can work.${missing} Configure the server using .env.example, restart it, then check again. No generated results are simulated.`, false, true);
    } else showNotice('');
  } catch (error) {
    configured = false;
    $('#connection-dot').className = 'connection-dot error';
    $('#connection-label').textContent = 'Server unavailable';
    showNotice(error.message, true, true);
  }
  setBusy(busy);
}

function updateCount() {
  $('#char-count').textContent = `${brief.value.length.toLocaleString('en')} / 12,000`;
  launch.disabled = busy || !configured || !brief.value.trim();
}

brief.addEventListener('input', () => {
  document.querySelectorAll('[data-example]').forEach(button => button.classList.remove('selected'));
  updateCount();
});

document.querySelectorAll('[data-example]').forEach(button => {
  button.addEventListener('click', () => {
    if (busy) return;
    brief.value = examples[button.dataset.example];
    document.querySelectorAll('[data-example]').forEach(item => item.classList.toggle('selected', item === button));
    updateCount();
    brief.focus();
  });
});

function stopUpdates() {
  if (source) source.close();
  source = null;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

function resetWorkspace() {
  stopUpdates();
  currentRun = null;
  $('#result-content').replaceChildren();
  $('#result-content').hidden = true;
  $('#result-empty').hidden = false;
  $('#result-empty h3').textContent = 'The team is exploring your brief.';
  $('#result-empty p').textContent = 'Three agents are developing independent perspectives. Their findings will be reviewed before the final specification is written.';
  $('#result-error').hidden = true;
  $('#download-button').disabled = true;
  $('#trace-button').disabled = true;
  $('#timeline').replaceChildren();
  $('#timeline-empty').hidden = true;
  $('#phase-badge').textContent = 'Starting the team';
  $('#phase-badge').className = 'phase-badge running';
  for (const card of document.querySelectorAll('[data-agent]')) {
    card.classList.remove('active', 'failed');
    const status = card.querySelector('.agent-status');
    status.textContent = 'Waiting';
    status.dataset.status = 'waiting';
    card.querySelector('.agent-output').textContent = 'Waiting for this agent to share its findings.';
  }
}

function phaseLabel(phase) {
  const names = { draft: 'Exploring in parallel', drafting: 'Exploring in parallel', discovery: 'Exploring in parallel', parallel: 'Exploring in parallel', review: 'QA is reviewing', reviewing: 'QA is reviewing', critique: 'QA is reviewing', revision: 'Resolving the plan', synthesis: 'Resolving the plan', synthesizing: 'Resolving the plan', final: 'Final specification', completed: 'Specification ready', complete: 'Specification ready', failed: 'Run interrupted' };
  return names[phase] || String(phase || 'Team is working').replace(/[_-]/g, ' ');
}

function displayStatus(status) {
  const labels = { idle: 'Ready', pending: 'Waiting', waiting: 'Waiting', running: 'Working', thinking: 'Thinking', working: 'Working', completed: 'Complete', done: 'Complete', failed: 'Failed', reviewing: 'Reviewing', synthesizing: 'Synthesizing' };
  return labels[status] || String(status || 'Waiting').replace(/[_-]/g, ' ');
}

function addInline(parent, text) {
  // Every model-provided fragment is a text node; no model HTML or links execute.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const strong = document.createElement('strong'); strong.textContent = part.slice(2, -2); parent.append(strong);
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const code = document.createElement('code'); code.textContent = part.slice(1, -1); parent.append(code);
    } else parent.append(document.createTextNode(part));
  }
}

function renderMarkdown(text, container) {
  const fragment = document.createDocumentFragment();
  let list = null;
  let paragraph = [];
  let code = null;
  const flush = () => { if (paragraph.length) { const p = document.createElement('p'); addInline(p, paragraph.join('\n')); fragment.append(p); paragraph = []; } };
  for (const line of String(text).split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      flush(); list = null;
      if (code) { fragment.append(code); code = null; } else code = document.createElement('pre');
      continue;
    }
    if (code) { code.textContent += `${line}\n`; continue; }
    if (!line.trim()) { flush(); list = null; continue; }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    const bullet = /^\s*([-*+]\s+|\d+[.)]\s+)(.+)$/.exec(line);
    if (heading) {
      flush(); list = null;
      const h = document.createElement(`h${heading[1].length}`); addInline(h, heading[2]); fragment.append(h);
    } else if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      flush(); list = null; fragment.append(document.createElement('hr'));
    } else if (bullet) {
      flush(); const tag = /^\d/.test(bullet[1]) ? 'OL' : 'UL';
      if (!list || list.tagName !== tag) { list = document.createElement(tag.toLowerCase()); fragment.append(list); }
      const li = document.createElement('li');
      if (tag === 'OL') li.value = Number.parseInt(bullet[1], 10);
      addInline(li, bullet[2]); list.append(li);
    } else if (/^>\s?/.test(line)) {
      flush(); list = null; const quote = document.createElement('blockquote'); addInline(quote, line.replace(/^>\s?/, '')); fragment.append(quote);
    } else { list = null; paragraph.push(line); }
  }
  flush(); if (code) fragment.append(code);
  container.replaceChildren(fragment);
}

function renderRun(run) {
  if (!run || typeof run.id !== 'string' || (currentRun && currentRun.id !== run.id)) return;
  currentRun = run;
  const terminal = run.status === 'completed' || run.status === 'failed';
  $('#phase-badge').textContent = run.status === 'completed' ? 'Specification ready' : run.status === 'failed' ? 'Run interrupted' : phaseLabel(run.phase);
  $('#phase-badge').className = `phase-badge ${run.status || 'running'}`;
  for (const agent of run.agents || []) {
    const card = document.querySelector(`[data-agent="${['product', 'qa', 'architect'].includes(agent.id) ? agent.id : 'unknown'}"]`);
    if (!card) continue;
    const status = card.querySelector('.agent-status');
    status.textContent = displayStatus(agent.status);
    status.dataset.status = agent.status || 'waiting';
    card.classList.toggle('active', ['running', 'thinking', 'working', 'reviewing', 'synthesizing'].includes(agent.status));
    card.classList.toggle('failed', agent.status === 'failed');
    const artifacts = Array.isArray(run.artifacts) ? run.artifacts.filter(item => item.agentId === agent.id) : [];
    if (artifacts.length) {
      const output = card.querySelector('.agent-output');
      output.replaceChildren();
      for (const artifact of artifacts) {
        const section = document.createElement('section');
        section.className = 'agent-artifact';
        const label = document.createElement('h4');
        label.textContent = phaseLabel(artifact.stage || 'Agent findings');
        const content = document.createElement('div');
        content.textContent = typeof artifact.content === 'string' ? artifact.content : JSON.stringify(artifact.content, null, 2);
        section.append(label, content);
        output.append(section);
      }
    } else if (agent.output) card.querySelector('.agent-output').textContent = typeof agent.output === 'string' ? agent.output : JSON.stringify(agent.output, null, 2);
  }
  const timeline = $('#timeline');
  const wasNearBottom = timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight < 50;
  const events = Array.isArray(run.events) ? run.events : [];
  const fragment = document.createDocumentFragment();
  for (const event of events) {
    const item = document.createElement('li');
    const time = document.createElement('time');
    time.className = 'event-time';
    const date = new Date(event.at);
    time.textContent = Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('en-GB', { hour12: false });
    if (!Number.isNaN(date.getTime())) { time.dateTime = date.toISOString(); time.title = date.toLocaleString(); }
    const dot = document.createElement('span'); dot.className = `event-dot ${/error|fail/.test(event.type || '') ? 'error' : ''}`; dot.setAttribute('aria-hidden', 'true');
    const message = document.createElement('span'); message.className = 'event-message';
    if (agentNames[event.agentId]) { const name = document.createElement('span'); name.className = 'event-agent'; name.textContent = agentNames[event.agentId]; message.append(name); }
    message.append(document.createTextNode(event.message || event.type || 'Runtime event'));
    item.append(time, dot, message); fragment.append(item);
  }
  timeline.replaceChildren(fragment);
  if (wasNearBottom) timeline.scrollTop = timeline.scrollHeight;
  $('#timeline-empty').hidden = events.length > 0;
  $('#trace-button').disabled = false;
  if (run.result) {
    renderMarkdown(run.result, $('#result-content'));
    $('#result-content').hidden = false;
    $('#result-empty').hidden = true;
    $('#download-button').disabled = false;
  }
  if (run.status === 'failed') {
    $('#result-empty').hidden = true;
    $('#result-error').textContent = run.error || 'The team could not complete this run. Check the server and provider configuration, then try again.';
    $('#result-error').hidden = false;
  }
  if (terminal) {
    stopUpdates();
    setBusy(false);
    $('#stream-status').className = 'stream-status';
    $('#stream-status').textContent = run.status === 'completed' ? `Run complete · ${events.length} recorded events · ${run.id}` : `Run failed · ${run.id}`;
  }
}

async function pollRun(id, generation) {
  if (polling || generation !== requestGeneration) return;
  polling = true;
  try {
    const run = await requestJSON(`/api/runs/${encodeURIComponent(id)}`);
    if (generation === requestGeneration) renderRun(run);
  } catch (error) {
    if (generation === requestGeneration) { $('#stream-status').textContent = `Connection interrupted: ${error.message} Retrying…`; $('#stream-status').className = 'stream-status reconnecting'; }
  } finally { polling = false; }
}

function watchRun(id, generation) {
  source = new EventSource(`/api/runs/${encodeURIComponent(id)}/events`);
  source.onopen = () => {
    if (generation !== requestGeneration) return;
    $('#stream-status').textContent = 'Live connection · showing actual runtime events';
    $('#stream-status').className = 'stream-status';
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  };
  source.onmessage = (event) => {
    if (generation !== requestGeneration) return;
    try { renderRun(JSON.parse(event.data)); } catch { $('#stream-status').textContent = 'An update could not be read. Fetching the latest run state…'; void pollRun(id, generation); }
  };
  source.onerror = () => {
    if (generation !== requestGeneration || !busy) return;
    $('#stream-status').textContent = 'Live connection interrupted. Polling the server while reconnecting…';
    $('#stream-status').className = 'stream-status reconnecting';
    if (!pollTimer) pollTimer = setInterval(() => { void pollRun(id, generation); }, 2500);
    void pollRun(id, generation);
  };
  void pollRun(id, generation);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !configured || !brief.value.trim()) return;
  const generation = ++requestGeneration;
  const input = brief.value.trim();
  resetWorkspace();
  setBusy(true);
  showNotice('');
  $('#stream-status').textContent = 'Creating a run…';
  try {
    const response = await requestJSON('/api/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brief: input }) });
    if (typeof response.id !== 'string' || !runIdPattern.test(response.id)) throw new Error('The server did not return a valid run identifier.');
    if (generation === requestGeneration) {
      setRunQuery(response.id);
      watchRun(response.id, generation);
    }
  } catch (error) {
    setRunQuery(null);
    stopUpdates();
    setBusy(false);
    showNotice(error.message, true);
    $('#phase-badge').textContent = 'Could not start';
    $('#phase-badge').className = 'phase-badge failed';
    $('#stream-status').textContent = 'No run started. Resolve the error above and try again.';
    $('#result-empty h3').textContent = 'The team could not start.';
    $('#result-empty p').textContent = 'Your brief is still here. Check the error message and try again when the server is ready.';
  }
});

function downloadBlob(name, value, type) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$('#download-button').addEventListener('click', async () => {
  if (!currentRun?.result) return;
  const button = $('#download-button');
  button.disabled = true;
  try {
    const response = await fetch(`/api/runs/${encodeURIComponent(currentRun.id)}/export`);
    if (!response.ok) {
      let message = `Could not export this run (${response.status}). Please try again.`;
      if ((response.headers.get('content-type') || '').includes('json')) {
        const data = await response.json();
        if (typeof data.error === 'string') message = data.error;
      }
      throw new Error(message);
    }
    const markdown = await response.text();
    if (!markdown.trim()) throw new Error('The server returned an empty export. Please try again.');
    downloadBlob('spec-rescue-specification.md', markdown, 'text/markdown;charset=utf-8');
  } catch (error) {
    showNotice(`Markdown export failed: ${error.message}`, true);
  } finally {
    button.disabled = !currentRun?.result;
  }
});
$('#trace-button').addEventListener('click', () => {
  if (currentRun) downloadBlob(`spec-rescue-${currentRun.id}-trace.json`, JSON.stringify(currentRun, null, 2), 'application/json');
});

window.addEventListener('pagehide', stopUpdates);
updateCount();

async function initialize() {
  const id = new URL(window.location.href).searchParams.get('run');
  if (!id) {
    await checkConfig();
    return;
  }
  // Lock the form before configuration or restoration can yield to user input.
  setBusy(true);
  await checkConfig();
  if (!runIdPattern.test(id)) {
    setRunQuery(null);
    setBusy(false);
    showNotice('This run link has an invalid identifier. Start a new rescue using the form.', true);
    return;
  }
  const generation = ++requestGeneration;
  resetWorkspace();
  launchLabel.textContent = 'Restoring your run…';
  $('#stream-status').textContent = 'Restoring the run from this server…';
  try {
    const run = await requestJSON(`/api/runs/${encodeURIComponent(id)}`);
    if (run.id !== id) throw new Error('The server returned a different run.');
    if (typeof run.brief === 'string') brief.value = run.brief;
    document.querySelectorAll('[data-example]').forEach(button => button.classList.remove('selected'));
    updateCount();
    renderRun(run);
    if (run.status === 'running') {
      setBusy(true);
      watchRun(id, generation);
    }
  } catch (error) {
    stopUpdates();
    setBusy(false);
    showNotice(`Could not restore this run: ${error.message} Runs are kept in server memory, so a server restart removes previous runs. You can start a new rescue below.`, true);
    $('#phase-badge').textContent = 'Run unavailable';
    $('#phase-badge').className = 'phase-badge failed';
    $('#result-empty h3').textContent = 'This run could not be restored.';
    $('#result-empty p').textContent = 'The server may have restarted, or the connection may be unavailable. Refresh to retry, or start a new rescue.';
    $('#stream-status').textContent = 'Run recovery failed. No new agents were started.';
  }
}

void initialize();
