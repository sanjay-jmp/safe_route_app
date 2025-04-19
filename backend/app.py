from flask import Flask, request, jsonify
import networkx as nx
import osmnx as ox
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ✅ Allow React to call Flask API


# Load the precomputed road network graph
G = ox.load_graphml("los_angeles_precomputed_risk1.graphml")

# Extract available time bins
sample_edge = next(iter(G.edges(data=True)))[-1]
available_time_bins = [key.replace("risk_", "") for key in sample_edge.keys() if key.startswith("risk_")]

def get_time_bin(user_time):
    """Find the correct time bin for a given user input time"""
    user_hour = int(user_time.split(":")[0])  # Extract hour
    selected_bin = available_time_bins[0]  # Default to earliest bin

    for bin_time in sorted(available_time_bins):
        bin_hour = int(bin_time.split(":")[0])
        if user_hour >= bin_hour:
            selected_bin = bin_time

    return selected_bin

def find_safest_route(G, source_lat, source_lon, dest_lat, dest_lon, time_bin):
    """Find the safest route based on crime risk at the determined time bin"""
    risk_attr = f"risk_{time_bin}"

    if risk_attr not in next(iter(G.edges(data=True)))[-1]:
        return {"error": f"Time bin '{time_bin}' not found in graph edges."}

    # Convert risk values to numeric (float)
    for u, v, data in G.edges(data=True):
        if risk_attr in data:
            data[risk_attr] = float(data[risk_attr])  # Convert risk values to float

    # Find nearest nodes
    start_node = ox.distance.nearest_nodes(G, source_lon, source_lat)
    end_node = ox.distance.nearest_nodes(G, dest_lon, dest_lat)

    # Compute the safest path
    safest_path = nx.astar_path(G, start_node, end_node, weight=risk_attr)

    # Convert nodes to coordinates
    route_coords = [(G.nodes[node]['y'], G.nodes[node]['x']) for node in safest_path]

    return route_coords

@app.route('/find_safe_route', methods=['GET'])
def get_safe_route():
    """API Endpoint to get the safest route"""
    source = request.args.get('source')  # Format: "lat,lon"
    destination = request.args.get('destination')  # Format: "lat,lon"
    user_time = request.args.get('time')  # Format: "HH:MM:SS"

    if not source or not destination or not user_time:
        return jsonify({"error": "Missing source, destination, or time"}), 400

    # Parse input values
    src_lat, src_lon = map(float, source.split(','))
    dest_lat, dest_lon = map(float, destination.split(','))

    # Determine the correct time bin
    time_bin = get_time_bin(user_time)

    # Get the safest route
    safe_route = find_safest_route(G, src_lat, src_lon, dest_lat, dest_lon, time_bin)

    return jsonify({'route': safe_route})

if __name__ == '__main__':
    app.run(debug=True)
