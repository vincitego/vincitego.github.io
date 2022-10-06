if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("./serviceWorker.js").catch(err => {
		console.error("Service Worker failed to register");
		console.error(err.stack);
	});
}


/* MP4Box */
const timeBeforeClear = 5 * 60000;
let files = [];
let fileIndex = 0;
let blobObjectURL = null;
let timeoutClear = null;
let mp4boxfile = null;
let mediaSource = null;
let vidBuffer = null;
let vidOffset = 0;
let pauseBuffering = false;
let loadingData = false;
let blankSrcURL = '';
let slideshowTimeout = null;


const fileTypes = {
	'IMAGE': 1,
	'TEXT': 2,
	'VIDEO': 3,
};


let directoryData = [];

function loadCacheData (url, data, prependNumber) {
	directoryData = [];

	if (data.length) {
		let passedDataIndex = 1;
		data.forEach(([keyword, endIndex]) => {
			for (; passedDataIndex <= endIndex; passedDataIndex++) {
				if (prependNumber === 1) {
					directoryData.push(`${url}/${passedDataIndex.toString().padStart(6, '0')} ${keyword}.png`);
				} else {
					directoryData.push(`${url}/${keyword} ${passedDataIndex.toString().padStart(6, '0')}.png`);
				}
			}
		});
	} else {
		directoryData.push(url);
	}

	const inputFileSlider = document.getElementById('fileSlider');
	const inputFileIndex = document.getElementById('fileIndex');
	inputFileSlider.max = directoryData.length;
	inputFileSlider.value = 1;
	inputFileSlider.disabled = true;
	inputFileIndex.innerHTML = 1;
	clearAll();
}


init();


async function init() {
	const inputHideShow = document.getElementById('hideShow');
	const inputFullscreen = document.getElementById('fullscreen');
	const inputFiles = document.getElementById('fileInput');
	const inputFiles2 = document.getElementById('fileInput2');
	const inputFileSlider = document.getElementById('fileSlider');
	const inputFileIndex = document.getElementById('fileIndex');
	const imgOutput = document.getElementById('imgOutput');
	const vidOutput = document.getElementById('vidOutput');
	const inputSlideshow = document.getElementById('slideshow');
	const inputSlideDuration = document.getElementById('slideDuration');
	const cacheListing = document.getElementById('cacheListing');
	const cacheStatus = document.getElementById('cacheStatus');
	const cacheButton = document.getElementById('cacheButton');


	inputFileSlider.oninput = function() {
		inputFileIndex.innerHTML = this.value;
	};


	inputFileSlider.onchange = function () {
		fileIndex = Number.parseInt(this.value) - 1;
		resetSlideshowTimeout();
	};


	inputHideShow.onclick = () => {
		if (inputHideShow.value == 'Hide') {
			inputHideShow.value = 'Show';
			clearAll();

		} else {
			inputHideShow.value = 'Hide';
			if (inputFileSlider.disabled) fileIndex = 0;
			loadImg();
		}
	};


	inputFiles.onchange = async e => {
		if (slideshowTimeout) {
			slideshowTimeout = clearTimeout(slideshowTimeout);
		}

		loadingData = false;
		clearText();
		clearImage();
		clearVideo();
		await sleep(1000);


		files = [];

		for (let i = 0; i < e.target.files.length; i++) {
			files.push(e.target.files[i]);
		}

		files.sort((a, b) => {
			if (a.name > b.name) return 1;
			if (a.name < b.name) return -1;
			return 0;
		});

		fileIndex = 0;
		inputFileSlider.max = files.length;
		inputFileSlider.value = 1;
		inputFileIndex.innerHTML = 1;

		if (inputHideShow.value == 'Hide')
			loadImg();
	};


	inputFiles2.onchange = async e => {
		const newFiles = [];

		for (let i = 0; i < e.target.files.length; i++) {
			newFiles.push(e.target.files[i]);
		}

		newFiles.sort((a, b) => {
			if (a.name > b.name) return 1;
			if (a.name < b.name) return -1;
			return 0;
		});

		files.push(...newFiles);
		inputFileSlider.max = files.length;
	};


	inputFullscreen.onclick = () => {
		if (imgOutput.src != blankSrcURL) imgOutput.requestFullscreen();
	};


	imgOutput.onclick = (e) => {
		const leftRegion = 0.33 * e.target.width;
		const rightRegion = e.target.width - leftRegion;
		const prevIndex = fileIndex;

		if (e.offsetX < leftRegion && (files.length || directoryData.length) && fileIndex > 0) {
			fileIndex--;
		}

		if (e.offsetX > rightRegion && ((files.length && fileIndex < files.length - 1) || (directoryData.length && fileIndex < directoryData.length - 1))) {
			fileIndex++;
		}

		if (fileIndex != prevIndex) {
			inputFileSlider.value = fileIndex + 1;
			inputFileIndex.innerHTML = fileIndex + 1;
			resetSlideshowTimeout();
		}
	};


	vidOutput.onerror = e => {
		if (e.target.error.message.includes('Empty src attribute')) return;
		console.error(e.target.error.message);
	}

	vidOutput.ontimeupdate = e => {
		if (e.target.buffered.length == 0 || !pauseBuffering) return;

		const currentTime = e.target.currentTime;

		for (let bufTime = 0; bufTime < e.target.buffered.length; bufTime++) {
			const bufTimeEnd = e.target.buffered.end(bufTime);
			const bufTimeLeft = (bufTimeEnd - currentTime);

			if (bufTimeLeft <= 30 && (fileIndex < files.length || fileIndex < directoryData.length)) {
				const earliestBufTimeStart = e.target.buffered.start(0);

				for (const sourceBuffer of mediaSource.sourceBuffers) {
					sourceBuffer.remove(earliestBufTimeStart, earliestBufTimeStart + 15);
				}

				pauseBuffering = false;
				loadVideoData();
				return;
			}
		}
	};


	inputSlideshow.onclick = () => {
		if (slideshowTimeout) {
			slideshowTimeout = clearTimeout(slideshowTimeout);
		} else {
			imgOutput.requestFullscreen();
			slideshowTimeout = setTimeout(nextImageInSlideshow, Number(inputSlideDuration.value) * 1000);
		}
	};

	inputSlideDuration.onchange = () => {
		localStorage.slideDuration = inputSlideDuration.value;
	}

	inputSlideDuration.value = localStorage.slideDuration ?? 10;


	cacheButton.addEventListener('click', () => {
		const cacheCategory = document.getElementById('cacheCategory').value;
		const cacheFolder = document.getElementById('cacheFolder').value;
		const cacheName = `assets_${cacheCategory}_${encodeURI(cacheFolder)}`;
		if (cacheCategory !== 'S' && !cacheFolder) return;
		
		caches.open(cacheName).then(async cache => {
			for (let i = 0; i < files.length; i++) {
				const url = `/assets/${cacheCategory}${cacheCategory === 'S' ? '' : `/${cacheFolder}`}/${files[i].name}`;
				const hasMatch = await cache.match(url);
				if (hasMatch) continue;

				const request = new Request(url);
				const response = new Response(files[i], { status: 200, statusText: 'OK' });
				response.headers.set('content-length', files[i].size);
				response.headers.set("content-type", "image/png");
				await cache.put(request, response);

				cacheStatus.textContent = `${i + 1} / ${files.length}`;
			}
		});
	});


	const cacheNames = (await caches.keys())
		.filter(cacheName => cacheName.startsWith('assets'))
		.sort();

	for (const cacheName of cacheNames) {
		const cache = await caches.open(cacheName);
		const cacheKeys = await cache.keys();

		const cacheFolders = cacheKeys.reduce((acc, req) => {
			const url = new URL(req.url);
			const paths = decodeURI(url.pathname).split('/');
			const fileName = paths.at(-1);
			const indexString = fileName.match(/\d{6}/)[0];
			const keywords = fileName.match(/(.+) \d{6}.png|\d{6} (.+).png/);
			const keyword = keywords[1] ?? keywords[2];
			const prependNumber = keywords[2] ? 1 : undefined;

			const category = paths[2];
			const key = category === 'S' ? paths.join('/') : paths.slice(0, -1).join('/');

			if (acc.has(key)) {
				const data = acc.get(key);

				if (data.has(keyword)) {
					const dataIndex = data.get(keyword);
					const index = Number(indexString);

					if (index > dataIndex)
						data.set(keyword, index);

				} else {
					data.set(keyword, Number(indexString));
				}

			} else {
				const data = new Map();
				acc.set(key, data);

				if (prependNumber)
					data.set('prepend', prependNumber);

				if (category !== 'S')
					data.set(keyword, Number(indexString));
			}

			return acc;
		}, new Map());
		
		for (const [folder, data] of [...cacheFolders.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
			const dataEntries = [...data.entries()];
			const prependNumber = dataEntries.find(([key]) => key === 'prepend') ? 1 : 0;
			const dataArray = dataEntries.filter(([key]) => key !== 'prepend').sort((a, b) => a[1] - b[1]);

			const div = document.createElement('div');
			div.textContent = folder + ' ';
			div.addEventListener('click', () => {
				if (confirm(`Load ${folder}?`))
					loadCacheData(folder, dataArray, prependNumber);
			});

			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'Delete';
			deleteButton.addEventListener('click', async () => {
				if (!confirm('Confirm Delete?')) return;
				let currentIndex = 1;

				if (folder.toLocaleLowerCase().endsWith('.png')) {
					const didDelete = await cache.delete(folder);
					console.log(didDelete);
				}

				for (const [keyword, maxIndex] of dataArray) {
					for (let i = currentIndex; i <= maxIndex; i++) {
						const didDelete = await cache.delete(`${folder}/${keyword} ${i.toString().padStart(6, '0')}.png`);
						
						if (!didDelete) {
							await cache.delete(`${folder}/${i.toString().padStart(6, '0')} ${keyword}.png`);
						}
					}

					currentIndex = maxIndex + 1;
				}
				
				div.remove();
			});
			div.append(deleteButton);

			cacheListing.append(div);
		}
	}
}


async function loadImg() {
	if (files.length == 0 && !directoryData.length) return;

	const txtOutput = document.getElementById('txtOutput');
	const imgOutput = document.getElementById('imgOutput');
	const vidOutput = document.getElementById('vidOutput');
	const inputFileIndex = document.getElementById('fileIndex');
	const inputFileSlider = document.getElementById('fileSlider');
	const inputSlideshow = document.getElementById('slideshow');
	let fileType, objBuffer;

	try {
		if (files.length > 0) {
			[fileType, objBuffer] = await getFileData(fileIndex);
		} else if (directoryData.length) {
			[fileType, objBuffer] = await fetchFileData(fileIndex);
		}
	} catch (err) {
		console.error(err);
		alert(err);
	}


	if (fileType === fileTypes.IMAGE) {
		const blob = new Blob([objBuffer.buffer]);

		if (blobObjectURL !== null) URL.revokeObjectURL(blobObjectURL);
		blobObjectURL = URL.createObjectURL(blob);

		imgOutput.className = 'show';
		imgOutput.src = blobObjectURL;
		inputFileSlider.disabled = false;
		inputSlideshow.disabled = false;
		

		if (timeoutClear) clearTimeout(timeoutClear);
		timeoutClear = setTimeout(clearAll, timeBeforeClear);


	} else if (fileType == fileTypes.TEXT) {
		const txtDecoder = new TextDecoder();
		const text = txtDecoder.decode(new Uint8Array(objBuffer.buffer));
		txtOutput.innerHTML = text.replace(/(?:\r\n|\r|\n)/g, '<br>');

		if (blobObjectURL !== null) URL.revokeObjectURL(blobObjectURL);
		if (timeoutClear) clearTimeout(timeoutClear);
		timeoutClear = setTimeout(clearAll, timeBeforeClear * 6);


	} else if (fileType === fileTypes.VIDEO) {
		vidBuffer = objBuffer.buffer;
		fileIndex = 1;
		inputFileIndex.innerHTML = 1;
		vidOutput.className = 'show';
		vidOutput.muted = true;
		inputFileSlider.disabled = true;
		inputSlideshow.disabled = true;


		mediaSource = new MediaSource;
		mediaSource.addEventListener('sourceopen', sourceOpen);

		if (blobObjectURL != null) URL.revokeObjectURL(blobObjectURL);
		blobObjectURL = URL.createObjectURL(mediaSource);
		vidOutput.src = blobObjectURL;

		if (timeoutClear) clearTimeout(timeoutClear);
		timeoutClear = setTimeout(clearAll, timeBeforeClear * 12);
	}
}


function sourceOpen(_) {
	if (mp4boxfile) mp4boxfile.flush();
	mp4boxfile = MP4Box.createFile();

	mp4boxfile.onError = function(e) { console.error(e); };

	mp4boxfile.onReady = function(info) {
		const mime = 'video/mp4';

		if (info.isFragmented) {
			mediaSource.duration = info.fragment_duration / info.timescale;
		} else {
			mediaSource.duration = info.duration / info.timescale;
		}


		mp4boxfile.onSegment = function(id, user, buffer, sampleNumber, last) {
			appendFragments(id, user, buffer, sampleNumber, last);
		};


		for (let t = 0; t < info.videoTracks.length; t++) {
			const track = info.videoTracks[t];
			const sourceBuffer = mediaSource.addSourceBuffer(`${mime};codecs="${track.codec}"`);
			sourceBuffer.trackID = track.id;
			sourceBuffer.fragments = [];
			sourceBuffer.fragmentIndex = 0;
			sourceBuffer.addEventListener('updateend', onUpdateEnd.bind(sourceBuffer));
			mp4boxfile.setSegmentOptions(track.id, sourceBuffer, { nbSamples: 1000 });
			break;
		}


		for (let t = 0; t < info.audioTracks.length; t++) {
			const track = info.audioTracks[t];
			const sourceBuffer = mediaSource.addSourceBuffer(`${mime};codecs="${track.codec}"`);
			sourceBuffer.trackID = track.id;
			sourceBuffer.fragments = [];
			sourceBuffer.fragmentIndex = 0;
			sourceBuffer.addEventListener('updateend', onUpdateEnd.bind(sourceBuffer));
			mp4boxfile.setSegmentOptions(track.id, sourceBuffer, { nbSamples: 1000 });
			break;
		}


		const initBuffers = mp4boxfile.initializeSegmentation();
		for (const initBuffer of initBuffers) {
			const sourceBuffer = initBuffer.user;
			sourceBuffer.appendBuffer(initBuffer.buffer);
		}


		mp4boxfile.start();
	};


	pauseBuffering = false;
	loadingData = true;
	vidBuffer.fileStart = 0;
	vidOffset = vidBuffer.byteLength;
	mp4boxfile.appendBuffer(vidBuffer);
	loadVideoData();

	vidBuffer = null;
}


async function loadVideoData() {
	const inputFileSlider = document.getElementById('fileSlider');
	const inputFileIndex = document.getElementById('fileIndex');
	const stopIndex = files.length > 0 ? files.length : directoryData.length;

	for (let i = fileIndex; i < stopIndex; i++) {
		if (pauseBuffering) return;
		if (!loadingData) return;

		try {
			let fileType, chunk;

			if (files.length > 0) {
				[fileType, chunk] = await getFileData(fileIndex);
			} else if (directoryData.length) {
				[fileType, chunk] = await fetchFileData(fileIndex);
			}

			const objBuffer = chunk.buffer;

			fileIndex++;
			inputFileSlider.value = fileIndex + 1;
			inputFileIndex.innerHTML = fileIndex;
			objBuffer.fileStart = vidOffset;
			vidOffset += objBuffer.byteLength;
			if (fileType == fileTypes.VIDEO && loadingData) mp4boxfile.appendBuffer(objBuffer);
		} catch (err) {
			console.error(err);
			break;
		}
	}

	loadingData = false;
}


function appendFragments(trackID, sourceBuffer, fragmentBuffer, sampleNumber, last) {
	sourceBuffer.fragments.push({
		trackID,
		fragmentBuffer,
		sampleNumber,
		last,
	});

	if (!pauseBuffering && !sourceBuffer.updating) onUpdateEnd.call(sourceBuffer);
}


function onUpdateEnd(_) {
	const fragments = this.fragments;

	if (pauseBuffering) return;
	if (fragments.length === 0) return;


	try {
		this.appendBuffer(fragments[0].fragmentBuffer);
		const fragment = fragments.shift();
		mp4boxfile.releaseUsedSamples(fragment.trackID, fragment.sampleNumber);
	} catch (err) {
		if (err.name !== 'QuotaExceededError') {
			throw err;
		}

		pauseBuffering = true;
	}
}


function getFileData(i) {
	return new Promise(function(resolve, reject) {
		const img = new Image;
		const imgObjectURL = URL.createObjectURL(files[i]);

		img.onload = async () => {
			const password = document.getElementById('password');
			let fileType, objBuffer;

			try {
				[fileType, objBuffer] = await desteg(img, password.value);
				resolve([fileType, objBuffer]);
			} catch (err) {
				reject(err);
			}

			URL.revokeObjectURL(imgObjectURL);
		};

		img.src = imgObjectURL;
	});
}


function fetchFileData(i) {
	return new Promise(function(resolve, reject) {
		const img = new Image;

		img.onload = async () => {
			const password = document.getElementById('password');
			let fileType, objBuffer;

			try {
				[fileType, objBuffer] = await desteg(img, password.value);
				resolve([fileType, objBuffer]);
			} catch (err) {
				reject(err);
			}
		};

		img.src = directoryData[i];
	});
}


async function desteg(image, strPW = null) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = image.width;
	canvas.height = image.height;
	ctx.drawImage(image, 0, 0);
	const tempBuffer = ctx.getImageData(0, 0, image.width, image.height).data;
	const origBuffer = tempBuffer.filter((el, i) => i % 4 !== 3);

	// convert from rgb to bgr, can be removed if all images are reencoded
	for (let i = 0; i < origBuffer.byteLength; i += 3) {
		[origBuffer[i], origBuffer[i + 1], origBuffer[i + 2]] = [origBuffer[i + 2], origBuffer[i + 1], origBuffer[i]];
	}

	const salt = new Uint8Array(32);
	const saltLength = salt.length;
	const iv = new Uint8Array(16);
	const ivLength = iv.length;
	let innerDataSizeBuffer = new Uint8Array(16);
	const sizeBufferLength = innerDataSizeBuffer.length;
	let byte = 0;
	let saltByte = 0;
	let ivByte = 0;
	let sizeByte = 0;
	let innerByte = 0;
	let fileType = 0;
	let stopByte = saltLength * 4;

	for (; byte < stopByte; byte += 4) {
		salt[saltByte] = (origBuffer[byte] & 3) + ((origBuffer[byte + 1] & 3) << 2) + ((origBuffer[byte + 2] & 3) << 4) + ((origBuffer[byte + 3] & 3) << 6);
		saltByte++;
	}

	if (!strPW) strPW = new TextDecoder().decode(salt);


	stopByte += ivLength * 4;
	for (; byte < stopByte; byte += 4) {
		iv[ivByte] = (origBuffer[byte] & 3) + ((origBuffer[byte + 1] & 3) << 2) + ((origBuffer[byte + 2] & 3) << 4) + ((origBuffer[byte + 3] & 3) << 6);
		ivByte++;
	}


	stopByte += sizeBufferLength * 4;
	for (; byte < stopByte; byte += 4) {
		innerDataSizeBuffer[sizeByte] = (origBuffer[byte] & 3) + ((origBuffer[byte + 1] & 3) << 2) + ((origBuffer[byte + 2] & 3) << 4) + ((origBuffer[byte + 3] & 3) << 6);
		sizeByte++;
	}

	try {
		const sizeCryptoKey = await deriveKey(strPW, salt, 'AES-CBC');
		const sizeDecipher = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, sizeCryptoKey, innerDataSizeBuffer);
		innerDataSizeBuffer = new Uint8Array(sizeDecipher);
		fileType = innerDataSizeBuffer[0];

		const innerDataSize = readUInt32LE(innerDataSizeBuffer, 1);
		if ((saltLength + ivLength + sizeBufferLength + innerDataSize) * 4 > origBuffer.length) throw new Error('Incorrect Password');
		let innerData = new Uint8Array(innerDataSize);


		stopByte += innerDataSize * 4;
		for (; byte < stopByte; byte += 4) {
			innerData[innerByte] = (origBuffer[byte] & 3) + ((origBuffer[byte + 1] & 3) << 2) + ((origBuffer[byte + 2] & 3) << 4) + ((origBuffer[byte + 3] & 3) << 6);
			innerByte++;
		}


		const cryptoKey = await deriveKey(strPW, salt, 'AES-GCM');
		const decipher = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, cryptoKey, innerData);
		innerData = new Uint8Array(decipher);

		return [fileType, innerData];
	} catch (err) {
		console.error(err.stack);
		throw err;
	}
}


function readUInt32LE(buf, offset = 0) {
	let res = 0;

	for (let i = offset; i < offset + 4; i++) {
		res += buf[i] * (256 ** (i - offset));
	}

	return res;
}


async function deriveKey(strPW, salt, algo) {
	const enc = new TextEncoder();

	try {
		const key = await crypto.subtle.importKey('raw', enc.encode(strPW), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

		const keyBuffer = await crypto.subtle.deriveKey(
			{
				'name': 'PBKDF2',
				salt: salt,
				'iterations': 99999,
				'hash': 'SHA-512',
			},
			key,
			{ 'name': algo, 'length': 256 },
			true,
			[ 'encrypt', 'decrypt' ],
		);

		return keyBuffer;
	} catch (err) {
		console.error(err);
		throw err;
	}
}


function clearAll() {
	document.getElementById('password').value = '';
	document.getElementById('hideShow').value = 'Show';
	clearText();
	clearImage();
	clearVideo();

	if (slideshowTimeout) {
		slideshowTimeout = clearTimeout(slideshowTimeout);
	}
}


function clearText() {
	const inputTxtOutput = document.getElementById('txtOutput');
	inputTxtOutput.innerHTML = '';
}


function clearImage() {
	const imgOutput = document.getElementById('imgOutput');
	imgOutput.src = '';
	blankSrcURL = imgOutput.src;

	if (blobObjectURL) {
		URL.revokeObjectURL(blobObjectURL);
		blobObjectURL = null;
	}
}


function clearVideo() {
	const vidOutput = document.getElementById('vidOutput');
	vidOutput.pause();
	vidOutput.className = '';
	vidOutput.src = '';
	loadingData = false;

	if (mediaSource) {
		for (const sourceBuffer of mediaSource.sourceBuffers) {
			if (sourceBuffer.updating) sourceBuffer.abort();
			mediaSource.removeBuffer(sourceBuffer);
		}

		mediaSource = null;
	}

	if (mp4boxfile) {
		mp4boxfile.flush();
		mp4boxfile = null;
	}

	if (blobObjectURL) {
		URL.revokeObjectURL(blobObjectURL);
		blobObjectURL = null;
	}
}


function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}


async function nextImageInSlideshow() {
	const inputFileSlider = document.getElementById('fileSlider');
	const inputFileIndex = document.getElementById('fileIndex');
	const inputSlideDuration = document.getElementById('slideDuration');
	slideshowTimeout = null;

	if ((files.length && fileIndex < files.length - 1) || (directoryData.length && fileIndex < directoryData.length - 1)) {
		fileIndex++;
		inputFileSlider.value = fileIndex + 1;
		inputFileIndex.innerHTML = fileIndex + 1;
		await loadImg();
		if (slideshowTimeout) clearTimeout(slideshowTimeout);
		slideshowTimeout = setTimeout(nextImageInSlideshow, Number(inputSlideDuration.value) * 1000);
	}
}


async function resetSlideshowTimeout() {
	if (slideshowTimeout) {
		slideshowTimeout = clearTimeout(slideshowTimeout);
		await loadImg();

		const inputSlideDuration = document.getElementById('slideDuration');
		slideshowTimeout = setTimeout(nextImageInSlideshow, Number(inputSlideDuration.value) * 1000);
	} else {
		loadImg();
	}
}
