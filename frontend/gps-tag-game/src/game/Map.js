import React, {useEffect, useState} from "react"
import img from "../pola_mokotowskie.png"
import MapBorders from "./MapBorders"
import gps from "../gps/gps"
import "./radar.css"
import Radar from './radar'
import Player from './Player'
import {getClient, getPlayers, runClient} from "../enemy/playerService"

const SCALE = -0.5
const Map = ({holderSize}) => {
    const [imgSize, setImgSize] = useState({height: 0, width: 0});
    const [userPos, setUserPos] = useState({height: 0, width: 0});
    const [players, setPlayers] = useState([])

    useEffect(() => {
        const image = new Image()
        image.src = img;
        console.log(image)
        image.onload = () => setImgSize({height: image.height, width: image.width})
        setGpsInterval(setUserPos)
        getPlayers().then(setPlayers)
    }, []);

    const userPoint = calculateUserPoint(imgSize, holderSize, userPos)
    const mapStyle = {
        top: `${userPoint[0]}px`,
        left: `${userPoint[1]}px`
    };
    return (
        <>
            <img src={img} alt='map' style={mapStyle}/>
            <Radar/>
            <span className="player"/>
            {players.map((player, id) => <Player player={player} imgSize={imgSize} mapPos={userPoint} key={id}/>)}
        </>
    );
}

export default Map;

function calculateUserPoint(imgSize, holderSize, userPos) {
    if (!imgSize.height || !imgSize.width) {
        return [0, 0]
    }
    const userRelativePos = [MapBorders.N - userPos.lat, userPos.lng - MapBorders.W]
    const imgScale = [imgSize.height / (MapBorders.N - MapBorders.S), imgSize.width / (MapBorders.E - MapBorders.W)]
    const userPoint = [(userRelativePos[0] * imgScale[0]) * SCALE + holderSize.height * 0.5, (userRelativePos[1] * imgScale[1]) * SCALE + holderSize.width * 0.5]

    return userPoint
}

function setGpsInterval(setUserPos) {
    let client = getClient()
    setInterval(() => getGpsPos(setUserPos, (location) => client.sendLocation(toPLayer(location))), 1000)
}

let memoize

async function getGpsPos(setUserPos, callback) {
    const location = await gps()
    if (memoize && memoize.height === location.height && memoize.width === location.width) {
        return
    }
    memoize = location

    let normalized = normalize(location)
    callback(location)
    setUserPos(normalized)
}

const normalize = location => (
    {lat: location.lat - 0.0361798, lng: location.lng - 0.0701858}
)

function toPLayer(location) {
    return {positionX: location.lat, positionY: location.lng, id: "ba457bf6-a617-4975-89b5-0bac63b110bc", playerId:  "0b63eb02-b66e-45ee-a111-66f1cd511436"}
}
