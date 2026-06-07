import asyncio
import os
import signal
import websockets
import orjson
import redis
from dotenv import load_dotenv

load_dotenv()

BINANCE_WS = (
    "wss://stream.binance.com:9443/stream?"
    "streams="
    "btcusdt@trade/"
    "ethusdt@trade/"
    "solusdt@trade/"
    "btcusdt@depth20@100ms/"
    "ethusdt@depth20@100ms/"
    "solusdt@depth20@100ms"
)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=False,
)

running = True


def shutdown_handler(signum, frame):
    global running
    running = False
    print("Stopping collector...")


signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)

async def publish_depth(data: dict):
    symbol = data["s"]

    payload = {
        "symbol": symbol,
        "bids": data["b"],
        "asks": data["a"],
        "event_time": data["E"],
    }

    redis_client.publish(
        f"depth:{symbol}",
        orjson.dumps(payload),
    )
async def publish_trade(data: dict):
    symbol = data["s"]

    payload = {
        "symbol": symbol,
        "trade_id": data["t"],
        "price": float(data["p"]),
        "quantity": float(data["q"]),
        "buyer_maker": data["m"],
        "event_time": data["E"],
        "trade_time": data["T"],
    }

    redis_client.publish(
        f"trades:{symbol}",
        orjson.dumps(payload),
    )

    print(
        f"[{symbol}] "
        f"{payload['price']} "
        f"qty={payload['quantity']}"
    )


async def consume():
    while running:
        try:
            print("Connecting to Binance...")

            async with websockets.connect(
                BINANCE_WS,
                ping_interval=20,
                ping_timeout=20,
            ) as ws:

                print("Connected.")

                while running:
                    message = await ws.recv()

                    packet = orjson.loads(message)

                    if "data" not in packet:
                        continue

                    data = packet["data"]

                    event = data.get("e")

                    if event == "trade":
                        await publish_trade(data)

                    elif event == "depthUpdate":
                        await publish_depth(data)

        except Exception as e:
            print("Collector error:", e)
            print("Reconnect in 5 seconds...")
            await asyncio.sleep(5)


async def main():
    await consume()


if __name__ == "__main__":
    asyncio.run(main())

