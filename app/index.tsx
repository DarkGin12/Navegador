import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Tab {
  id: number;
  url: string;
  title: string;
}

export default function Index() {
  const [url, setUrl] = useState('https://www.google.com');
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, url: 'https://www.google.com', title: 'Google' }]);
  const [currentTab, setCurrentTab] = useState<number>(1);
  const webviewRefs = useRef<{ [key: number]: any }>({});
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<{ url: string, title: string }[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleAddTab = () => {
    const newTabId = tabs.length + 1;
    const newTabUrl = 'https://www.google.com';
    setTabs([...tabs, { id: newTabId, url: newTabUrl, title: 'Google' }]);
    setCurrentTab(newTabId);
  };

  const deleteLastCharacter = () => {
    if (webviewRefs.current[currentTab]) {
      webviewRefs.current[currentTab].injectJavaScript(`
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
          activeElement.value = activeElement.value.slice(0, -1);
        }
        true;
      `);
    }
  };

  const handleGoPress = () => {
    let formattedUrl = url.trim();

    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setTabs(tabs.map(tab => (tab.id === currentTab ? { ...tab, url: formattedUrl, title: formattedUrl } : tab)));

    if (!history.includes(formattedUrl)) {
      setHistory(prevHistory => [...prevHistory, formattedUrl]);
    }

    setUrl(formattedUrl);
  };

  const handleReload = () => {
    if (webviewRefs.current[currentTab]) {
      webviewRefs.current[currentTab].reload();
    }
  };

  const handleBack = () => {
    if (webviewRefs.current[currentTab]) {
      webviewRefs.current[currentTab].goBack();
    }
  };

  const handleForward = () => {
    if (webviewRefs.current[currentTab]) {
      webviewRefs.current[currentTab].goForward();
    }
  };

  const updateTabTitle = (title: string) => {
    setTabs(tabs.map(tab => (tab.id === currentTab ? { ...tab, title } : tab)));
  };

  const addToFavorites = () => {
    const currentTabData = tabs.find(tab => tab.id === currentTab);
    if (currentTabData && !favorites.some(favorite => favorite.url === currentTabData.url)) {
      setFavorites(prevFavorites => [...prevFavorites, { url: currentTabData.url, title: currentTabData.title }]);
    }
  };

  const removeFromHistory = (urlToRemove: string) => {
    setHistory(history.filter(item => item !== urlToRemove));
  };

  const removeFromFavorites = (urlToRemove: string) => {
    setFavorites(favorites.filter(favorite => favorite.url !== urlToRemove));
  };

  const renderTab = ({ item }: { item: Tab }) => (
    <TouchableOpacity
      style={styles.tab}
      onPress={() => setCurrentTab(item.id)}
    >
      <Text style={styles.tabText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderVirtualKeyboard = () => (
    <Modal visible={keyboardVisible} transparent={true} animationType="slide">
      <View style={styles.keyboardContainer}>
        <View style={styles.keyboardRow}>
          {[...'1234567890'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => sendKey(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {[...'QWERTYUIOP'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => sendKey(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {[...'ASDFGHJKL'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => sendKey(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {[...'ZXCVBNM'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => sendKey(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          <TouchableOpacity style={styles.key} onPress={() => sendKey(' ')}>
            <Text style={styles.keyText}>Espaço</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyboardRow}>
        <TouchableOpacity style={styles.key} onPress={() => deleteLastCharacter()}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => setKeyboardVisible(false)}>
          <Text style={styles.closeButtonText}>Fechar Teclado</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const sendKey = (key: string) => {
    if (webviewRefs.current[currentTab]) {
      webviewRefs.current[currentTab].injectJavaScript(`document.activeElement.value += '${key}'; true;`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <FlatList
          data={tabs}
          renderItem={renderTab}
          keyExtractor={item => item.id.toString()}
          horizontal
          style={styles.tabList}
        />
        <TouchableOpacity onPress={handleAddTab} style={styles.addTabButton}>
          <Icon name="plus" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForward} style={styles.iconButton}>
          <Icon name="arrow-right" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReload} style={styles.iconButton}>
          <Icon name="refresh" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={addToFavorites} style={styles.iconButton}>
          <Icon name="user-plus" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.iconButton}>
          <Icon name="history" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFavoritesModalVisible(true)} style={styles.iconButton}>
          <Icon name="star" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setKeyboardVisible(true)} style={styles.iconButton}>
          <Icon name="gamepad" size={24} color="#000" />
        </TouchableOpacity>
        {renderVirtualKeyboard()}
      </View>
      <View style={styles.addressBar}>
        <TextInput
          style={styles.textInput}
          value={url}
          onChangeText={setUrl}
          placeholder="Digite a URL ou pesquisa"
          onSubmitEditing={handleGoPress}
          returnKeyType="go"
        />
      </View>
      <WebView
        ref={ref => {
          if (ref) {
            webviewRefs.current[currentTab] = ref;
          }
        }}
        source={{ uri: tabs.find(tab => tab.id === currentTab)?.url || 'https://www.google.com' }}
        style={styles.webView}
        startInLoadingState={true}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={true}
        allowsFullscreenVideo={true}
        allowsLinkPreview={true}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          updateTabTitle(nativeEvent.title);

          if (!history.includes(nativeEvent.url)) {
            setHistory(prevHistory => [...prevHistory, nativeEvent.url]);
          }

          setUrl(nativeEvent.url);
        }}
      />

      {/* Modal para Histórico */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.modalItemContainer}>
                <Text style={styles.modalItem}>{item}</Text>
                <TouchableOpacity onPress={() => removeFromHistory(item)}>
                  <Icon name="trash" size={16} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal para Favoritos */}
      <Modal
        visible={favoritesModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.url}
            renderItem={({ item }) => (
              <View style={styles.modalItemContainer}>
                <Text style={styles.modalItem}>{item.title}</Text>
                <TouchableOpacity onPress={() => removeFromFavorites(item.url)}>
                  <Icon name="trash" size={16} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity onPress={() => setFavoritesModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tab: {
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
  },
  addTabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f1f1f1',
  },
  iconButton: {
    padding: 10,
  },
  addressBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f1f1f1',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  webView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  modalItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  modalItem: {
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
  },
  tabList: {
    flex: 1,
    flexDirection: 'row',
  },
  keyboardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  keyboardRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 0 },
  key: { marginHorizontal: 0, padding: 10, backgroundColor: '#333', borderRadius: 5 },
  keyText: { color: '#FFF', fontSize: 18 },
});