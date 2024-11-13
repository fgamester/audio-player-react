import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import "./styles/audio_player.css";


const AudioPlayer = () => {
    const urlBase = "https://playground.4geeks.com"
    const songRef = useRef()
    const [play, setPlay] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(undefined)
    const [displayTime, setDisplayTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [playList, setPlaylist] = useState(null)
    const [currentVolume, setCurrentVolume] = useState(0.5)

    const updatePLaylist = async () => {
        const response = await fetch("https://playground.4geeks.com/sound/songs")
        const data = await response.json()
        setPlaylist(data.songs)
    }

    const updateDisplayTime = (e) => {
        setDisplayTime(Math.floor(e.target.currentTime));
    };

    useEffect(() => {
        updatePLaylist()
    }, []);

    const playControl = () => {
        currentIndex !== undefined && (play ? songRef.current.pause() : songRef.current.play())
    }

    const changeRef = (song, index) => {
        if (index == currentIndex) {
            playControl()
        } else if (index == playList.length) {
            songRef.current.src = urlBase + playList[0].url
            setCurrentIndex(0)
        } else if (index < 0) {
            songRef.current.src = urlBase + playList[2].url
            setCurrentIndex(2)
        } else {
            songRef.current.src = urlBase + song.url
            setCurrentIndex(index)
        }
    }

    const setPlayerVolume = (e = null, fromSlider = false) => {
        if (fromSlider && e) {
            setCurrentVolume(() => e.target.value);
            songRef.current.volume = e.target.value;
        } else {
            songRef.current.volume = currentVolume;
        }
    }

    const songEnded = () => {
        changeRef(playList[currentIndex + 1], currentIndex + 1)
    }

    const sliderTimeChanger = (e) => {
        if (currentIndex !== undefined) {
            const newTime = e.target.value;
            songRef.current.currentTime = newTime;
        }
    }

    const SongList = () => (
        <ul className="pointerHover list-group pb-pb">
            {playList && playList.map((item, index) => (
                <li className="list-group-item bg-dark text-white border-secondary d-flex align-items-center gap-1" onClick={() => changeRef(item, index)} key={index} >
                    {currentIndex == index && (!play ? (
                        <FaPause onClick={() => playControl()} />
                    ) : (
                        <FaPlay onClick={() => playControl()} />
                    ))} {item.name}
                </li>
            ))}
        </ul>
    )

    const VolumeIcon = ({ className }) => {
        if (currentVolume == 0) {
            return <FaVolumeMute className={className} />
        } else if (currentVolume < 0.5) {
            return <FaVolumeDown className={className} />
        } else {
            return <FaVolumeUp className={className} />
        }
    }

    const metaDataInit = (songDuration) => {
        setDuration(songDuration)
        setPlayerVolume()
    }

    const muteToggle = () => {
        if (currentVolume > 0) {
            setCurrentVolume(0)
            songRef.current.volume = 0
        } else {
            songRef.current.volume = 0.5
            setCurrentVolume(0.5)
        }
    }

    return (
        <div>
            <SongList />

            <audio onTimeUpdate={(e) => updateDisplayTime(e)} ref={songRef} src={songRef.src} autoPlay onPlay={() => setPlay(true)} onPause={() => setPlay(false)}
                onEnded={() => songEnded()} onLoadedMetadata={(e) => metaDataInit(Math.round(e.target.duration))} />

            <div className="player-bar fixed-bottom bg-black pt-3">
                <div className="timer-div d-flex justify-content-center align-items-center">
                    <p className="text-white align-self-center my-0 mx-2 p-0" >
                        {currentIndex !== undefined && (Math.floor(displayTime / 60) + ":" + ((displayTime % 60) < 10 ? "0" + (displayTime % 60) : (displayTime % 60)))}
                    </p>
                    <input className="time-control" type="range" min={0} max={duration} value={displayTime}
                        onChange={(e) => sliderTimeChanger(e)} />

                    <p className="text-white align-self-center my-0 mx-2 p-0" >
                        {currentIndex !== undefined && (Math.floor(duration / 60) + ":" + ((duration % 60) < 10 ? "0" + (duration % 60) : (duration % 60)))}
                    </p>
                </div>
                <div className="d-flex align-items-center justify-content-between pos">
                    <div className="position-absolute start-50 translate-middle-x">
                        <div className="controls p-3 d-flex justify-content-center pointerHover ">
                            <FaStepBackward onClick={() => changeRef(playList[currentIndex - 1], currentIndex - 1)} className="text-white fs-5 mx-2 pointerHover" />
                            {play ? (
                                <FaPause onClick={() => playControl()} className="text-white fs-5 mx-2 resumeBtn pointerHover" />
                            ) : (
                                <FaPlay onClick={() => playControl()} className="text-white fs-5 mx-2 resumeBtn pointerHover" />
                            )}
                            <FaStepForward onClick={() => changeRef(playList[currentIndex + 1], currentIndex + 1)} className="text-white fs-5 mx-2 pointerHover" />
                        </div>
                    </div>
                    <div className="w-50 d-flex align-items-center justify-content-start ms-auto">
                        <div className="d-flex align-items-center ms-5">
                            <div className="pointerHover ms-2">
                                <VolumeIcon className='text-white fs-5' />
                            </div>
                            <input className="volume-control mt-1 me-2" type="range" min={0} max={1} step={0.01} value={currentVolume}
                                onChange={(e) => setPlayerVolume(e, true)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default AudioPlayer